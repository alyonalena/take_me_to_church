import './App.css';
import { Input, Tree } from 'antd'
import { useState, useMemo } from 'react'
import { DownOutlined, FrownFilled, FrownOutlined, UserSwitchOutlined, UserOutlined } from '@ant-design/icons'

import Keyboard from "react-simple-keyboard"
import "react-simple-keyboard/build/css/index.css"

const getParentKey = (key, tree) => {
  let parentKey
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some((item) => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey
};
console.info(dataList)

function App() {
  const [layout, setLayout] = useState("default")

  const defaultData = [ 
    { 
      title: "Настоятели", 
      key: '0-0',
      children: [ 
        { 
          title: 'Александр', key: '0-0-0', 
        }, 
        { 
          title: 'Дмитрий', key: '0-0-1', 
        }, 
      ], 
    },
    { 
      title: "Духовенство", 
      key: '0-1',  
      children: [ 
        { 
          title: 'Иван', key: '0-1-0', 
        }, 
        { 
          title: 'Сергей', key: '0-1-1', 
        }, 
      ], 
    },
    
    { 
      title:  "Хор", 
      key: '0-2',
      children: [ 
        { 
          title: 'Павел', key: '0-2-0' 
        }, 
        { 
          title: 'Пётр', key: '0-2-1'
        }, 
      ], 
    }, 
  ]

  const dataList = []

  const generateList = (data) => {
    for (let i = 0; i < data.length; i++) {
      const node = data[i]
      const { key } = node
      dataList.push({  title: key, key})
      if (node.children) {
        generateList(node.children)
      }
    }
  }
  generateList(defaultData)

  console.info(dataList)
  const [expandedKeys, setExpandedKeys] = useState([])
  const [searchValue, setSearchValue] = useState('')
  const [autoExpandParent, setAutoExpandParent] = useState(true)

  const onExpand = (newExpandedKeys) => {
    setExpandedKeys(newExpandedKeys)
    setAutoExpandParent(false)
  }

  const onChange = (input) => {

    const newExpandedKeys = dataList
      .map((item) => {
        if (item.title.includes(input)) {
          return getParentKey(item.key, defaultData)
        }
        return null
      })
      .filter((item, i, self) => !!(item && self.indexOf(item) === i))
    setExpandedKeys(newExpandedKeys)
    setSearchValue(input)
    setAutoExpandParent(true)
  }

  const treeData = useMemo(() => {
    const loop = (data) =>
      data.map((item) => {
        const strTitle = item.title
        const index = strTitle.indexOf(searchValue)
        const beforeStr = strTitle.substring(0, index)
        const afterStr = strTitle.slice(index + searchValue.length)
        const title =
          index > -1 ? (
            <span key={item.key}>
              {beforeStr}
              <span className="site-tree-search-value">{searchValue}</span>
              {afterStr}
            </span>
          ) : (
            <span key={item.key}>{strTitle}</span>
          )
        if (item.children) {
          return { title, key: item.key, children: loop(item.children) }
        }

        return {
          title,
          key: item.key,
        }
      })

    return loop(defaultData)
  }, [searchValue])

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
      <div className="App-main">
        <div className="Search-bar">
          <Input.Search
            value={searchValue}
            placeholder="Поиск..."
          />
        </div>
        <div className="Tree-wrapper">
            <Tree
                showLine
                onExpand={onExpand}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                treeData={treeData}
            />
        </div>
      </div>
      <div className="Keyboard-bar">
        <Keyboard
          layout={greekLayout}
          layoutName={layout}
          onChange={onChange}
          onKeyPress={onKeyPress}
        />
      </div>
    </div>
  )
}

export default App
