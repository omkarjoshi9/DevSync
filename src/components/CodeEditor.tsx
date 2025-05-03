import { Editor } from '@monaco-editor/react'
import React, { useRef, useState } from 'react'
import { useTheme } from './theme-provider'

import { CODE_SNIPPETS, LANGUAGE_VERSIONS } from '@/constants'
import LanguageSelector from './LanguageSelector'
import Output from './Output'


const CodeEditor = () => {

  const editorRef = useRef()
  const [language,setLanguage] = useState("javascript");
  const { theme } = useTheme()
  const [value , setValue] = useState(CODE_SNIPPETS["javascript"])
  const resolveTheme = () => {
    if (theme === 'light') return 'vs'
    if (theme === 'dark') return 'vs-dark'
  }
  const onMount =(editor)=>{
    editorRef.current=editor;
    editor.focus();
  }
  const monacoTheme = resolveTheme()
  const onSelect = (language) =>{
    setLanguage(language);
    setValue(
      CODE_SNIPPETS[language]
    );
  };
  return (
    <div className='flex w-full'>
      <div className='w-[70%]'>
        <LanguageSelector language={language} onSelect={onSelect}/>
        <Editor
          height='80vh'
          language={language}
          defaultValue={value}
          theme={monacoTheme}
          value={value}
          onMount={onMount}
          onChange={
              (value,event) => setValue(value)
          }
        />
      </div>
      <div  className='w-[30%]'>
        <Output/>
      </div>
    </div>
  )
}

export default CodeEditor
