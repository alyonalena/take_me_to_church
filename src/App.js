import './App.css'
import { Input, Tree, Modal, Typography, Flex, Spin } from 'antd'
import { useState, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'

import Keyboard from "react-simple-keyboard"
import "react-simple-keyboard/build/css/index.css"
import BackgroundImg from '../src/img/background.png'

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
  const [selectedPersonId, setSelectedPersonId] = useState(null)
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

  const { data: personData, isLoading: isPersonLoading } = useQuery({
    queryKey: ['person', selectedPersonId],
    queryFn: async () => {
      if (!selectedPersonId) return null
      const response = await fetch(`https://dq94-qj2m-e53n.gw-1a.dockhost.net/api/people/${selectedPersonId}/`, {
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
    enabled: !!selectedPersonId && isModalVisible,
  }) 

  const showModal = () => {
    setIsModalVisible(true)
  };

  const handleOk = () => {
    setIsModalVisible(false)
    setSelectedPersonId(null)
  };

  const handleCancel = () => {
    setIsModalVisible(false)
    setSelectedPersonId(null)
  };

  const [layout, setLayout] = useState("default")

  // Fallback default data in case API fails or returns unexpected format
  const fallbackData = []

  // Use fetched data if available, otherwise use fallback
  const defaultData = useMemo(() => {

    if (dataSource?.results && Array.isArray(dataSource.results) && dataSource.results.length > 0) {
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
              <span style={{ fontSize: '1.2rem' }}><strong>{title}</strong></span>
            )
          }

          if (item.children) {
            return { title, key: item.key, id: item.id, children: loop(item.children) }
          }

          return {
            title,
            id: item.id,
            key: item.key,
          }
      })
    return loop(defaultData)
  }, [searchValue, defaultData])

  const onKeyPress = (button) => {
      if (button === "{shift}" || button === "{lock}") {
          setLayout(layout === "default" ? "shift" : "default")
      }
  }

  const russianLayout = {
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
      const personId = item?.node?.id
      if (personId) {
        setSelectedPersonId(personId)
        showModal()
      }
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

               
  const getImage = () => {
    let Img 
    if (personData.photos && personData.photos.length > 0) {
      const mainPhoto = personData.photos.find(p => p.is_main) || personData.photos[0]
      const photoUrl = mainPhoto.photo_url
      Img = photoUrl.startsWith('http') 
        ? photoUrl 
        : `https://dq94-qj2m-e53n.gw-1a.dockhost.net${photoUrl}`
    }
     
    return Img ? (
      <img
          draggable={false}
          alt="avatar"
          src={Img}
          style={{
              width: '40%',
              borderRadius: 10,
              objectFit: 'cover',
          }}
      />
    ) : null
  }

  return (
        <div className="App-content" style={{ backgroundImage: `url(${BackgroundImg})`, backgroundColor: '#445B6D', backgroundSize: 'auto 100vh', backgroundPosition: 'top right', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }}>
            <header className="App-header">
              <Typography.Title 
                level={2} 
                style={{ 
                  color: '#E7E7E7',
                  fontFamily: "'circle-contrast_medium', sans-serif",
                  fontWeight: 500
                }}
              >Добро пожаловать в Спассо-Парголовскую Церковь</Typography.Title>                
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
                style={{ top: '5vh'}}
                styles={{
                  body: {
                    height: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                  }
                }}
                width={'50%'}
                open={isModalVisible}
                onOk={handleOk}
                okText="Закрыть"
                onCancel={handleCancel}
                cancelButtonProps={{ style: { display: 'none' } }} // Hides the Cancel button
            >
              {isPersonLoading ? (
                <Spin size="large" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }} />
              ) : personData ? (
                <>
                  <Flex justify="space-between" style={{ paddingBottom: 20 }}>
                      {getImage()}
                      <Flex vertical justify="start" style={{ padding: 20 }}>
                          <Typography.Title level={2} 
                          style={{ 
                            color: '#1B3041',
                            fontFamily: "'circle-contrast_medium', sans-serif",
                            fontWeight: 500
                          }}>
                            {personData.rank ? `${personData.rank} ` : ''}
                            {personData.first_name} {personData.middle_name} {personData.last_name}
                          </Typography.Title>
                          <Typography.Text secondary style={{ color: '#1B3041'}}>
                            {personData.birth_year && personData.death_year 
                              ? `(${personData.birth_year}-${personData.death_year})`
                              : personData.birth_year 
                              ? `(род. ${personData.birth_year})`
                              : ''}
                          </Typography.Text>
                          {personData.job_title && (
                            <Typography.Title level={4} style={{ color: '#1B3041'}}>
                              {personData.job_title}
                              {personData.work_start_year && personData.work_end_year
                                ? ` в ${personData.work_start_year}-${personData.work_end_year} гг.`
                                : personData.work_start_year
                                ? ` с ${personData.work_start_year} г.`
                                : ''}
                            </Typography.Title>
                          )}
                      </Flex>
                  </Flex>
                  <div className='modal-content'>
                    {personData.description && (
                      <div style={{ whiteSpace: 'pre-line' }}>
                        {personData.description.split('\r\n').map((paragraph, index) => (
                          <p key={index} style={{ margin: '0 0 1em 0' }}>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{paragraph}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </Modal>
            <div className="Keyboard-bar">
                <Keyboard
                    layout={russianLayout}
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
