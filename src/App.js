import './App.css'
import { Input, Tree, Modal, Typography, Flex, Spin, Drawer, Button, Tabs, Carousel, List, Avatar, Image } from 'antd'
import { useState, useMemo, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileImageOutlined } from '@ant-design/icons'

import Keyboard from "react-simple-keyboard"
import "react-simple-keyboard/build/css/index.css"
import BackgroundImg from '../src/img/background.png'
import pargolovo1 from '../src/img/pargolovo1.jpg'
import pargolovo2 from '../src/img/pargolovo2.jpg'
import image from '../src/img/image.jpg'

const contentStyle = {
  margin: 0,
  height: '160px',
  color: '#fff',
  lineHeight: '160px',
  textAlign: 'center',
  background: '#445B6D',
};

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

const useInactivityReload = (timeout = 180000) => { // 3 минуты по умолчанию
  useEffect(() => {
    let inactivityTimer

    const resetTimer = () => {
      clearTimeout(inactivityTimer)
      inactivityTimer = setTimeout(() => {
        window.location.reload()
      }, timeout)
    }

    // Инициализация таймера
    resetTimer();

    // События, сбрасывающие таймер
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(event => 
      document.addEventListener(event, resetTimer, { passive: true })
    )

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => 
        document.removeEventListener(event, resetTimer)
      )
    }
  }, [timeout])
}

function App() {
  useInactivityReload()

  const [isFirstOnTop, setIsFirstOnTop] = useState(true)
  const [showPicMode, setShowPicMode] = useState(false)


  const handleClickOne = () => setIsFirstOnTop(true)
  const handleClickTwo = () => setIsFirstOnTop(false)


  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isPictureModalVisible, setIsPictureModalVisible] = useState(false)
  const [selectedPersonId, setSelectedPersonId] = useState(null)
  const [isKeyboardDrawerOpen, setIsKeyboardDrawerOpen] = useState(false)
  const keyboard = useRef(null)

  const { data: dataSource, isLoading } = useQuery({
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

  const showPicture = () => {
    setIsPictureModalVisible(true)
  }

  const closePicture = () => {
    setIsPictureModalVisible(false)
  }

  const handleOk = () => {
    setIsModalVisible(false)
    setSelectedPersonId(null)
  };

  const handleCancel = () => {
    setIsModalVisible(false)
    setShowPicMode(false)
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
      const loop = (data) => {
        const searchLower = searchValue.toLowerCase()
        const hasSearch = searchLower.length > 0
        
        return data
          .map((item) => {
            const strTitle = item.title
            let title
            const strTitleLower = item.title.toLowerCase()
            const index = strTitleLower.indexOf(searchLower)
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
              // For parent items, always show them but filter their children
              const filteredChildren = loop(item.children)
              
              // Always return parent, even if it has no matching children
              return { 
                title, 
                key: item.key, 
                id: item.id, 
                children: filteredChildren 
              }
            }

            // For leaf items, only show if they match the search (or if no search)
            if (hasSearch && index === -1) {
              return null // Hide leaf items that don't match
            }

            return {
              title,
              id: item.id,
              key: item.key,
              icon: <FileImageOutlined />
            }
          })
          .filter(item => item !== null) // Remove null items (hidden items)
      }
    return loop(defaultData)
  }, [searchValue, defaultData])

  const treeDataDocs = [
    {
      title: 'Документ 1',
      id: 1,
      key: 1,
      icon: pargolovo1,
      descripton: 'Описание'
    },
    {
      title: 'Документ 2',
      id: 2,
      key: 2,
      icon: pargolovo2,
      descripton: 'Описание'
    },
    {
      title: 'Документ 3',
      id: 3,
      key: 3,
      icon: pargolovo1,
      descripton: 'Описание'
    },
    {
      title: 'Документ 4',
      id: 4,
      key: 4,
      icon: pargolovo2,
      descripton: 'Описание'
    }
  ]

  console.info(treeData)

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

  const onTreeSelect = (selectedKeys, info) => {
    setIsKeyboardDrawerOpen(false)
    const node = info.node
    if (node.children) {
      // Toggle expansion for parent nodes
      const key = node.key
      if (expandedKeys.includes(key)) {
        setExpandedKeys(expandedKeys.filter(k => k !== key))
      } else {
        setExpandedKeys([...expandedKeys, key])
      }
    } else {
      // Open modal for leaf nodes
      const personId = node.id
      if (personId) {
        setSelectedPersonId(personId)
        showModal()
      }
    }
  }

  const onDocTreeSelect = () => {    
    setShowPicMode(true)
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
                level={1} 
                style={{ 
                  color: '#E7E7E7',
                  fontFamily: "'circle-contrast_medium', sans-serif",
                  fontWeight: 500,
                  fontSize: '2.2rem'
                }}
              >Добро пожаловать в Спасо-Парголовский Храм</Typography.Title>                
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
                <div style={{ position: "relative", width: '90%', height: '90vh', margin: '50px' }}>
                  <div
                    onClick={handleClickOne}
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "#1A2C3A",
                      color: "#E7E7E7",
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "flex-start",
                      flexDirection: "column",
                      cursor: "pointer",
                      border: '1px solid rgb(5, 12, 18, 0.6)',
                      borderRadius: '0.3rem',
                      zIndex: isFirstOnTop ? 2 : 1,
                      opacity: isFirstOnTop ? 1 : 0.6,
                      width: '90%',
                      height: '90%',
                      boxShadow: '4px 4px 4px 0px rgb(5, 12, 18, 0.7)',
                      transform: isFirstOnTop ? "translateX(0) translateY(70px)" : "translateX(70px) translateY(0)",
                      transition: "transform 0.5s ease, opacity 0.5s ease",
                      padding: '0 20px'
                    }}
                  >
                    <Typography.Title 
                      level={2} 
                      style={{ 
                        color: '#E7E7E7',
                        fontFamily: "'circle-contrast_medium', sans-serif",
                        fontWeight: 500
                      }}
                    >Биографии</Typography.Title>
                    <div style={{ width: '100%', overflowY: 'hidden', display: 'flex' }}>
                      <Tabs
                        style={{ height: '100%', width: '25%' }}
                        defaultActiveKey="1" 
                        tabPosition="left"
                        items={[
                          {
                            key: '1',
                            label: 'Настоятели'
                          },
                          {
                            key: '2',
                            label: 'Клир'
                          },
                          {
                            key: '3',
                            label: 'Именитые прихожане'
                          },
                        ]} 
                        onChange={(key) => console.log(key)} 
                      />       
                      <div className="Tree-wrapper" style={{ width: '75%'}}>
                        <div >
                            { isLoading ? (
                                <Spin 
                                    size="large" 
                                    style={{ 
                                        display: 'flex', 
                                        justifyContent: 'center', 
                                        alignItems: 'center', 
                                        minHeight: '200px' 
                                    }} 
                                />
                            ) : (
                              <>
                                <Tree
                                    style={{backgroundColor: 'rgba(255, 255, 255, 0)'}}
                                    showLine
                                    blockNode
                                    onExpand={onExpand}
                                    expandedKeys={expandedKeys}
                                    autoExpandParent={autoExpandParent}
                                    treeData={treeData[0]?.children || []}
                                    onSelect={onTreeSelect}
                                />{
                                  /*
                                  <List
                                  itemLayout="horizontal"
                                  dataSource={treeData[0]?.children || []}
                                  renderItem={(item) => (
                                    <List.Item
                                      onClick={() => {}}
                                    >
                                    <List.Item.Meta
                                        avatar={null}
                                        title={item.title}
                                      />
                                    </List.Item>
                                  )}
                                />
                                  */
                                }
                              </>
                            )}
                            </div>
                        </div>           
                  </div>
                  </div>
                  <div
                    onClick={handleClickTwo}
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "#1A2C3A",
                      border: '1px solid rgb(5, 12, 18, 0.6)',
                      borderRadius: '0.3rem',
                      color: "#E7E7E7",
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "flex-start",
                      flexDirection: "column",
                      cursor: "pointer",
                      width: '90%',
                      zIndex: isFirstOnTop ? 1 : 2,                      
                      opacity: isFirstOnTop ? 0.6 : 1,
                      height: '90%',
                      boxShadow: '4px 4px 4px 0px rgb(5, 12, 18, 0.7)',
                      transform: isFirstOnTop ? "translateX(70px) translateY(0)" : "translateX(0) translateY(70px)",
                      transition: "transform 0.5s ease, opacity 0.5s ease",
                      padding: '0 20px'
                    }}
                  >
                    <Typography.Title 
                      level={2} 
                      style={{ 
                        color: '#E7E7E7',
                        fontFamily: "'circle-contrast_medium', sans-serif",
                        fontWeight: 500
                      }}
                    >Архив фотографий и документов</Typography.Title>
                    <div style={{ width: '100%', overflowY: 'hidden', display: 'flex' }}>
                      <Tabs
                        style={{ height: '100%', width: '25%' }}
                        tabPosition="left"
                        defaultActiveKey="1" 
                        items={[
                          {
                            key: '1',
                            label: 'Парголово XIX - н.XX вв.',
                          },
                          {
                            key: '2',
                            label: 'Жизнь Храма',
                          },
                          {
                            key: '3',
                            label: 'Интересные документы',
                          },
                        ]} 
                        onChange={(key) => console.log(key)} 
                      />
                      <div className='Tree-wrapper' style={{ width: '75%'}}>
                              <div>
                                  {isLoading ? (
                                      <Spin size="large" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }} />
                                  ) : (
                                      <>
                                        <Image.PreviewGroup
                                          preview={{
                                            mask: { blur: true},
                                            onChange: (current, prev) => {}
                                          }}
                                        >
                                         <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={pargolovo1}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={pargolovo2}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={image}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={pargolovo1}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={image}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={pargolovo2}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={pargolovo2}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={image}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={pargolovo1}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={image}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={pargolovo2}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={pargolovo2}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={image}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={pargolovo1}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={image}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={pargolovo2}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={image}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={pargolovo1}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={image}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={pargolovo2}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={image}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={pargolovo1}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={image}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={pargolovo2}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={image}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={pargolovo1}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={image}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={pargolovo2}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={image}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={pargolovo1}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={image}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={pargolovo2}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={image}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={pargolovo1}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={image}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={pargolovo2}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={image}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={pargolovo1}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={image}
                                          />
                                          <Image
                                          style={{padding: 8}}
                                            height={100}
                                            alt="svg image"
                                            src={pargolovo2}
                                          />
                                        </Image.PreviewGroup>
                                      </>
                                  )}
                          </div>
                      </div>
                    </div>
                  </div>
                </div> 
            </div>
            <Modal
                title=""
                style={{ top: '5vh'}}
                styles={{
                  body: {
                    height: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                  }
                }}
                width={'100%'}
                open={isPictureModalVisible}
                onCancel={closePicture}
                cancelButtonProps={{ style: { display: 'none' } }} // Hides the Cancel button
            >
              <Image src={pargolovo1}/>
            </Modal>
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
              { showPicMode ? (
                <>
                  <br/>
                  { selectedPersonId && (
                      <Button onClick={() => {setShowPicMode(false)}}>
                        Вернуться к биографии
                      </Button>
                  )}
                  <br/>
                  <Carousel afterChange={() => {}} dotPosition={'top'}>
                    <div>
                      <h3 style={contentStyle}>1</h3>
                    </div>
                    <div>
                      <h3 style={contentStyle}>2</h3>
                    </div>
                    <div>
                      <h3 style={contentStyle}>3</h3>
                    </div>
                    <div>
                      <h3 style={contentStyle}>4</h3>
                    </div>
                  </Carousel>
                </>
              ): 
                isPersonLoading ? (
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
                            <Typography.Text secondary style={{ color: '#1B3041' }}>
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
                            <Typography.Title level={5} style={{ color: '#1B3041'}}>
                              Архив фотографий и документов:
                            </Typography.Title>
                            <Tree
                                style={{ color: 'black' }}
                                showLine
                                blockNode
                                onExpand={onExpand}
                                expandedKeys={expandedKeys}
                                autoExpandParent={autoExpandParent}
                                treeData={treeDataDocs}
                                onSelect={onDocTreeSelect}
                            />
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
            { isFirstOnTop && (
              <>
                <div style={{ 
                  position: 'fixed', 
                  bottom: 20, 
                  left: '50%', 
                  transform: 'translateX(-50%)', 
                  zIndex: 1001
                }}>
                  <Button
                    style={{boxShadow: '4px 4px 4px 0px rgb(5, 12, 18, 0.7)'}}
                    size="large"
                    onClick={() => setIsKeyboardDrawerOpen(isKeyboardDrawerOpen ? false: true)}
                  >
                    { isKeyboardDrawerOpen ? "Скрыть клавиатуру" : "Открыть клавиатуру" }
                  </Button>
                </div>
                <Drawer
                    placement="bottom"
                    height={350}
                    open={isKeyboardDrawerOpen}
                    onClose={() => {
                      setIsKeyboardDrawerOpen(false)
                      if (keyboard.current) {
                        keyboard.current.clearInput()
                      }
                    }}
                    closable={false}
                    mask={false}
                >
                    <Keyboard
                      layout={russianLayout}
                      style={{color: 'black'}}
                      keyboardRef={(r) => (keyboard.current = r)} 
                      layoutName={layout}
                      onChange={onChange}
                      onKeyPress={onKeyPress}
                    />
                    <br/>
                </Drawer>
              </>
            )}
        </div>
    )
}

export default App
