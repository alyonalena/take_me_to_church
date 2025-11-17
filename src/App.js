import './App.css';
import { Input, Tree } from 'antd'
import { useState } from 'react'
import { DownOutlined, FrownFilled, FrownOutlined, UserSwitchOutlined, UserOutlined } from '@ant-design/icons'

import Keyboard from "react-simple-keyboard"
import "react-simple-keyboard/build/css/index.css"

function App() {
  const [input, setInput] = useState("")
  const [layout, setLayout] = useState("default")

  const treeData = [ 
    { 
      title: 'Служители', 
      key: '0-0', 
      icon: <UserSwitchOutlined />, 
      children: [ 
        { 
          title: 'Иванов', key: '0-0-0', icon: <UserOutlined />, 
        }, 
        { 
          title: 'Петров', key: '0-0-1', icon: ({ selected }) => (selected ? <UserOutlined /> : <UserOutlined />), 
        }, 
      ], 
    },
    { 
      title: 'Апостолы', 
      key: '0-1', 
      icon: <UserSwitchOutlined />, 
      children: [ 
        { 
          title: 'Павел', key: '0-0-2', icon: <UserOutlined />, 
        }, 
        { 
          title: 'Пётр', key: '0-0-3', icon: ({ selected }) => (selected ? <UserOutlined /> : <UserOutlined />), 
        }, 
      ], 
    }, 
  ]

  const onChange = (input) => {
    setInput(input)
  };

  const onKeyPress = (button) => {
    if (button === "{shift}" || button === "{lock}") {
      setLayout(layout === "default" ? "shift" : "default")
    }
  }

  const greekLayout = {
    default: [
      "` 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
      "{tab} ; й ц у к е н г ш щ з х ъ [ ] \\",
      "{lock} ф ы в а п р о л д ж э ΄ ' {enter}",
      "{shift} я ч с м и т ь б ю , . / {shift}",
      ".com @ {space}",
    ],
    shift: [
      "~ ! @ # $ % ^ & * ( ) _ + {bksp}",
      "{tab} : ΅ Й Ц У К Е Н Г Ш Щ З Х Ъ { } |",
      '{lock} Ф Ы В А П Р О Л Д Ж Э ¨ " {enter}',
      "{shift} > Я Ч С М И Т Ь Б Ю < > ? {shift}",
      ".com @ {space}",
    ],
  }

  return (
    <div className="App-content">
      <header className="App-header">
        Добро пожаловать!
      </header>
      <br/>
        <Input.Search value={input} placeholder="Поиск..." variant="filled" />
        <br/><br/>
      <div>
        <Tree 
          showIcon 
          defaultExpandAll 
          defaultSelectedKeys={['0-0-0']} 
          switcherIcon={<DownOutlined />} 
          treeData={treeData} 
        /> 
        <Keyboard
          layout={greekLayout}
          layoutName={layout}
          onChange={onChange}
          onKeyPress={onKeyPress}
        />
      </div>
    </div>
  );
}

export default App;
