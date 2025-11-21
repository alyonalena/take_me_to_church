import './App.css'
import { Input, Tree, Modal, Typography, Flex, Spin } from 'antd'
import { useState, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'

import Keyboard from "react-simple-keyboard"
import "react-simple-keyboard/build/css/index.css"
import Img from '../src/img/image.jpg'
import BackgroundImg from '../src/img/background.jpg'

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
  const keyboard = useRef(null)

  const { data: dataSource, isLoading, isError } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const response = await fetch("https://dq94-qj2m-e53n.gw-1a.dockhost.net/api/groups/", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    },
  }) 

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

  // Fallback default data in case API fails or returns unexpected format
  const fallbackData = [ 
    { 
      title: "Настоятели", 
      key: '0'
    },
    { 
      title: "Духовенство", 
      key: '1'
    },    
    { 
      title:  "Хор", 
      key: '2',
    }, 
  ]

  // Use fetched data if available, otherwise use fallback
  const defaultData = useMemo(() => {
    console.info(dataSource)
    if (dataSource?.results && Array.isArray(dataSource.results) && dataSource.results.length > 0) {
      console.info(dataSource.results)
      return dataSource.results
    }
    return fallbackData
  }, [dataSource])

  const dataList = useMemo(() => {
    const list = []
    const generateList = (data) => {
      for (let i = 0; i < data.length; i++) {
        const node = data[i]
        const { key, title } = node
        list.push({ title, key})
        if (node.children) {
          generateList(node.children)
        }
      }
    }
    generateList(defaultData)
    return list
  }, [defaultData])

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
          let title
          const strTitleLower = item.title.toLowerCase()
          const index = strTitleLower.indexOf(searchValue.toLowerCase())
          const beforeStr = strTitle.substring(0, index)
          const afterStr = strTitle.slice(index + searchValue.length)
          const value = strTitle.substring(index, index + searchValue.length)
          title =
          title =
            index > -1 ? (
              <span key={item.key}>
                {beforeStr}
                <span className="site-tree-search-value">{value}</span>
                {afterStr}
              </span>
            ) : (
              <span key={item.key}>{strTitle}</span>
            )
          if (item.children) {
            title = (
              <span style={{ fontSize: '1.1rem' }}>{title}</span>
            )
          }

          if (item.children) {
            title = (
              <span style={{ fontSize: '1.1rem' }}>{title}</span>
            )
          }

          if (item.children) {
            return { title, key: item.key, children: loop(item.children) }
          }

          return {
            title,
            key: item.key,
          }
      })
console.info(defaultData)
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
          ".ru @ {space}",
      ],
  }

  const onTreeSelect = (item) => {
    if (item?.node?.children) {
      return 
    } else {
      showModal()
    }
  }

  const onClear = () => {
    setSearchValue('')
    setExpandedKeys([])
    setAutoExpandParent(false)
    if (keyboard.current) {
      keyboard.current.clearInput()
    }
  }

  const text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\r\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\r\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.".split('\r\n')
  return (
        <div className="App-content" style={{ backgroundImage: `url(${BackgroundImg})`, backgroundSize: 'cover', backgroundPosition: 'right', backgroundRepeat: 'no-repeat' }}>
            <header className="App-header">
              <Typography.Title level={2} style={{ color: '#1B3041'}}><span/>Добро пожаловать в Спассо-Парголовскую Церковь</Typography.Title>                
            </header>
            <div className="App-main">
                <div className="Search-bar">
                    <Input.Search
                      size='large'
                      value={searchValue}
                      placeholder="Поиск..."
                      allowClear={true}
                      onClear={onClear}
                      onChange={(e) => onChange(e.target.value)}
                    />
                </div>
                <div className="Tree-wrapper">
                    {isLoading ? (
                      <Spin size="large" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }} />
                    ) : isError ? (
                      <Typography.Text type="danger" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                        Ошибка загрузки данных. Используются данные по умолчанию.
                      </Typography.Text>
                    ) : (
                      <Tree
                          style={{backgroundColor: 'rgba(255, 255, 255, 0)'}}
                          showLine
                          onExpand={onExpand}
                          expandedKeys={expandedKeys}
                          autoExpandParent={autoExpandParent}
                          treeData={treeData}
                          onSelect={(id, item) => onTreeSelect(item)}
                      />
                    )}
                </div>
            </div>
            <Modal
                title=""
                open={isModalVisible}
                onOk={handleOk}
                okText="Закрыть"
                onCancel={handleCancel}
                cancelButtonProps={{ style: { display: 'none' } }} // Hides the Cancel button
            >
              <Flex justify="space-between" style={{ paddingBottom: 20 }}>
                  <img
                      draggable={false}
                      alt="avatar"
                      src={Img}
                      style={{
                          width: 200,
                          borderRadius: 10,
                      }}
                  />
                  <Flex vertical justify="start" style={{ padding: 20 }}>
                      <Typography.Title level={2} style={{ color: '#1B3041'}}>Фамилия Имя Отчество</Typography.Title>
                      <Typography.Text secondary style={{ color: '#1B3041'}}> 1897 - 1945</Typography.Text>
                      <Typography.Title level={4} style={{ color: '#1B3041'}}>Должность</Typography.Title>
                      <Typography.Title level={2} style={{ color: '#1B3041'}}>Фамилия Имя Отчество</Typography.Title>
                      <Typography.Text secondary style={{ color: '#1B3041'}}> 1897 - 1945</Typography.Text>
                      <Typography.Title level={4} style={{ color: '#1B3041'}}>Должность</Typography.Title>
                  </Flex>
              </Flex>
              <p>{text.map(t => <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{t}</p>)}</p>
            </Modal>
            <div className="Keyboard-bar">
                <Keyboard
                    layout={greekLayout}
                    keyboardRef={(r) => (keyboard.current = r)} 
                    layoutName={layout}
                    onChange={onChange}
                    onKeyPress={onKeyPress}
                />
            </div>
        </div>
    )
}

export default App
