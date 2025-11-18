import './App.css'
import { ConfigProvider, Input, Tree, Modal, Typography } from 'antd'
import { useState, useMemo } from 'react'

import Keyboard from "react-simple-keyboard"
import "react-simple-keyboard/build/css/index.css"

const getParentKey = (key, tree) => {
  let parentKey
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i]
    if (node.children) {
      if (node.children.some((item) => item.key === key)) {
        parentKey = node.key
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children)
      }
    }
  }
  return parentKey
}

function App() {

  const [isModalVisible, setIsModalVisible] = useState(false)

  const showModal = () => {
    setIsModalVisible(true)
  };

  const handleOk = () => {
    setIsModalVisible(false)
    // Perform any "OK" related actions here
  };

  const handleCancel = () => {
    setIsModalVisible(false)
    // Perform any "Cancel" related actions here
  };

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
      const { key, title } = node
      dataList.push({ title, key})
      if (node.children) {
        generateList(node.children)
      }
    }
  }
  generateList(defaultData)

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
        if (item.title.toLowerCase().includes(input.toLowerCase())) {
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
          const strTitleLower = item.title.toLowerCase()
          const index = strTitle.indexOf(searchValue.toLowerCase())
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

  const onTreeSelect = (item) => {
    if (item?.node?.children) {
      return 
    } else {
      showModal()
    }
  }

  return (
      <ConfigProvider 
          theme={{
            token: {
                "colorPrimary": "#2a1645",
                "colorInfo": "#2a1645",
              }
          }}
      >
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
                          onSelect={(id, item) => onTreeSelect(item)}
                      />
                  </div>
              </div>
              <Modal
                  title="Личная информация"
                  visible={isModalVisible} // Use 'open' instead of 'visible' in Ant Design v5+
                  onOk={handleOk}
                  okText="Закрыть"
                  onCancel={handleCancel}
                  cancelButtonProps={{ style: { display: 'none' } }} // Hides the Cancel button
              >
                <Typography.Title>Фамилия Имя Отчество</Typography.Title>
                <p>Должность</p>
                <p>Опыт работы</p>
                <p>Информация о человеке...</p>
                <p>Что-то о его работе</p>
              </Modal>
              <div className="Keyboard-bar">
                  <Keyboard
                      layout={greekLayout}
                      layoutName={layout}
                      onChange={onChange}
                      onKeyPress={onKeyPress}
                  />
              </div>
          </div>
      </ConfigProvider>
    )
}

export default App
