const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    subscriptionTier: string;
  };
  accessToken: string;
  refreshToken: string;
}

class ApiClient {
  private isRefreshing = false;
  private refreshPromise: Promise<{ accessToken: string; refreshToken: string } | null> | null = null;

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async refreshAccessToken(): Promise<{ accessToken: string; refreshToken: string } | null> {
    // If already refreshing, return the existing promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    const { refreshToken } = this.getAuthTokens();

    if (!refreshToken) {
      this.isRefreshing = false;
      return null;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        const data = await response.json();

        if (response.ok && data.success && data.data) {
          setAuthTokens(data.data.accessToken, data.data.refreshToken);
          return {
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
          };
        } else {
          // Refresh failed, clear tokens
          clearAuthTokens();
          return null;
        }
      } catch (error) {
        clearAuthTokens();
        return null;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOn401 = true
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && retryOn401) {
        console.log('Token expired, attempting to refresh...');
        const refreshed = await this.refreshAccessToken();
        
        if (refreshed) {
          console.log('Token refreshed, retrying request...');
          // Retry the original request with new token
          return this.request<T>(endpoint, options, false);
        } else {
          console.log('Token refresh failed, redirecting to login...');
          // Clear tokens and redirect to login
          clearAuthTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return {
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Session expired. Please login again.',
            },
          };
        }
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.error || {
            code: 'UNKNOWN_ERROR',
            message: data.message || 'An error occurred',
          },
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error occurred',
        },
      };
    }
  }

  // Auth endpoints
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async googleAuth(idToken: string): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
  }

  getAuthTokens() {
    return {
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken'),
    };
  }

  async logout(refreshToken?: string): Promise<ApiResponse<{ message: string }>> {
    const token = refreshToken || this.getAuthTokens().refreshToken;
    if (token) {
      return this.request<{ message: string }>('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: token }),
      });
    }
    return { success: true, data: { message: 'Logged out' } };
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> {
    // Don't auto-refresh on refresh endpoint to avoid infinite loops
    return this.request<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }, false); // retryOn401 = false
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: any }>> {
    return this.request<{ user: any }>('/auth/me', {
      method: 'GET',
    });
  }

  // Room endpoints
  async createRoom(data?: { password?: string; language?: string; settings?: any }): Promise<ApiResponse<{ room: any }>> {
    return this.request<{ room: any }>('/rooms/create', {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  async joinRoom(data: { roomId: string; password?: string }): Promise<ApiResponse<{ room: any; participants: any[] }>> {
    return this.request<{ room: any; participants: any[] }>('/rooms/join', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRoom(roomId: string): Promise<ApiResponse<{ room: any; participants: any[] }>> {
    // Remove # from roomId if present and encode it properly for URL
    const cleanRoomId = roomId.replace(/^#/, '')
    const encodedRoomId = encodeURIComponent(cleanRoomId)
    console.log('getRoom API call:', { original: roomId, clean: cleanRoomId, encoded: encodedRoomId, url: `/rooms/${encodedRoomId}` })
    return this.request<{ room: any; participants: any[] }>(`/rooms/${encodedRoomId}`, {
      method: 'GET',
    });
  }

  // Code execution
  async executeCode(data: {
    roomId: string;
    language: string;
    code: string;
    input?: string;
  }): Promise<ApiResponse<{ executionId: string; status: string }>> {
    return this.request<{ executionId: string; status: string }>('/execute', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getExecution(executionId: string): Promise<ApiResponse<{ execution: any }>> {
    return this.request<{ execution: any }>(`/execute/${executionId}`, {
      method: 'GET',
    });
  }
}

export const api = new ApiClient();

// Auth helpers
export const setAuthTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

export const getAuthTokens = () => {
  return {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
  };
};

export const clearAuthTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('accessToken');
};

