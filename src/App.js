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
      const response = await fetch("https://severely-superior-monster.cloudpub.ru/api/groups/", {
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
        console.info(node)
        const { key, title, first_name } = node
        list.push({ title: title || first_name, key})
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

  const testText = "В настоящее время идет процесс канонизации протоиерея Стефана Черняева и причисления его к лику Новомучеников и Исповедников Церкви Русской.\r\nСтефан Иванович родился 24 января 1886 года в городе Пскове в многодетной крестьянской семье. В 1906 году Стефан со своим старшим братом окончил Псковскую Духовную семинарию, после чего приехал в Петербург.\r\nЗдесь он успешно окончил Духовную Академию и Императорский Петроградский Археологический институт. Вскоре Стефан Иванович женился на дочери потомственного почетного гражданина Антонине Федоровне Никифоровой. У них было четверо детей: два мальчика и две девочки.\r\nС 1910 по 1913 год он нес послушание псаломщика в Успенской церкви на Сенной площади. В августе 1913 года его рукоположили во диакона и перевели в Спасо Бочаринский храм. 19 июня 1916 года в Свято-Троицком соборе Александро-Невской лавры отец Стефан принял священнический сан. Через год его перевели в церковь святых апостолов Петра и Павла, где позднее назначили настоятелем.\r\nС приходом советской власти на Церковь обрушились гонения, которые не обошли стороной и отца Стефана. Чтобы прокормить семью, батюшка, не оставляя священнического служения, вынужден был подрабатывать на железной дороге. В 1922 году в церкви произошел обновленческий раскол, в результате которого большая часть городских храмов присоединилась к раскольникам. Несмотря на это, отец Стефан сохранил верность законной Патриаршей церкви. Ни он, ни храмы, в которых он был настоятелем, никогда не были связаны с обновленцами.\r\n25 августа 1930 года батюшку арестовали по надуманному обвинению в хранении мелкой серебряной монеты. В этой ситуации отец Стефан повел себя как настоящий христианин. Та малая сумма, за которую его обвиняли, принадлежала не ему, а его соседке. Батюшка скрыл этот факт от следствия и взял вину на себя. Тем самым он спас пожилую женщину от тюрьмы, проведя вместо нее в заключении несколько месяцев.\r\nНужно отметить, что отец Стефан был очень мужественным человеком, что проявлялось неоднократно. Например, он не побоялся организовать материальную помощь опальным ссыльным священникам, за что сам оказался под надзором у органов.\r\nНа него неоднократно поступали доносы, в которых он обвинялся в антисоветской настроенности. Из этих доносов можно увидеть, каким на самом деле был отец Стефан. Например, в одном из них секретный агент, будучи врагом церкви, дает характеристику батюшке: «Черняев – добрый, миролюбивый, отзывчивый, хороший проповедник, не ищет славы, положения и чести…».\r\nВ августе 1935 года советские власти закрыли Петропавловскую церковь, где служил батюшка. Вскоре по решению священноначалия его перевели настоятелем в Спасо-Парголовский храм. Отец Стефан и здесь пользовался большим доверием и любовью прихожан, что не могло нравиться советской власти. На батюшку продолжали поступать различные доносы, и вскоре на него сформировалось большое досье.\r\nС началом «Большого террора» отца Стефана арестовали одним из первых. 9 октября 1937 года его заключили в тюрьму на Арсенальной набережной. На допросах следователь склонял его к предательству ближних.".split('\r\n')
  return (
        <div className="App-content" style={{ backgroundImage: `url(${BackgroundImg})`, backgroundSize: 'cover', backgroundPosition: 'top right', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }}>
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
              <Flex justify="space-between" style={{ paddingBottom: 20 }}>
                  <img
                      draggable={false}
                      alt="avatar"
                      src={Img}
                      style={{
                          width: '40%',
                          borderRadius: 10,
                      }}
                  />
                  <Flex vertical justify="start" style={{ padding: 20 }}>
                      <Typography.Title level={2} 
                      style={{ 
                        color: '#1B3041',
                        fontFamily: "'circle-contrast_medium', sans-serif",
                        fontWeight: 500
                      }}>Протоиерей Стефан Иванович Черняев</Typography.Title>
                      <Typography.Text secondary style={{ color: '#1B3041'}}>(1886-1937)</Typography.Text>
                      <Typography.Title level={4} style={{ color: '#1B3041'}}>настоятель в 1935-1937 гг.</Typography.Title>
                  </Flex>
              </Flex>
              <div className='modal-content'>
                <p>{testText.map(t => <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{t}</p>)}</p>
              </div>
              
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
