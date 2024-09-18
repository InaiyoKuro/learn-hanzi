import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import fileDictionary from './assets/dictionary.txt';
import { TbReload } from "react-icons/tb";
import { HiMiniSpeakerWave } from "react-icons/hi2";
import { FaExchangeAlt } from "react-icons/fa";

function App() {
  const [text,setText] = useState('我')
  const [filterText,setFilterText] = useState(['我'])
  const [dictionary,setDictonary] = useState([])
  const [selected,setSelected] = useState(0)
  const [pinyin,setPinyin] = useState("")
  const [isHanzi,setIsHanzi] = useState(true)
  const [isLoop,setIsLoop] = useState(false)
  const [isReDraw,setIsReDraw] = useState(false)


  const objRef = useRef()

  useEffect(() => {
      const checkAudio = document.querySelectorAll("audio.speak")
      if(checkAudio.length > 0) {checkAudio.forEach(e => e.remove())}
  }, [isLoop])
  
  useEffect(() => {
    if(!isReDraw){
      const interval = setInterval(() => {
        objRef.current.data = `./svgs/${handleCodePoints(filterText[selected])}.svg`
      }, 20000);
      return () => clearInterval(interval);
    }
  }, [filterText,selected]); 


  useEffect(() => {
    // Set file dictionary
    fetch(fileDictionary)
      .then((res) => res.text())
      .then((text) => {
        const lines = text.split("\n").filter(line => line.trim() !== "")
        const parsedLines = lines.map(line => JSON.parse(line))
        
        setDictonary(parsedLines) 
        setPinyin(parsedLines.filter(e => filterText.includes(e.character)).map(e => e.pinyin))
      })
      .catch((e) => console.error(e));

    },[])


  const handleCodePoints = (code) => {
    if(code === undefined) return
    return Array.from(code).map(char => char.codePointAt(0))
  }


  const handleSearch = () => {
    if(text.length > 40 || text === "" || text.match(/\w/g)) return

    const filterChars  = []
    const filterPinyin = []
    const uniqueChars = [...new Set(text.split(''))]

    const getCharsPinyin = dictionary.filter(e => uniqueChars.includes(e.character)).map(e => [e.character,e.pinyin[0]])

    // Get Char Same Text
    uniqueChars.forEach(e => {
      getCharsPinyin.forEach(en => {
        if(en[0].includes(e)){
          filterChars.push(e)
          filterPinyin.push(en[1])
        }
      })
    })

    setFilterText(filterChars)
    setPinyin(filterPinyin)
  }

  const handleSearchPinyin = () => {
    const hasChineseCharacters = /[\u4e00-\u9fff]/;

    if(text.length > 40 || text === "" || hasChineseCharacters.test(text)) return

    const filterChars  = []
    const filterPinyin = []
    const uniqueChars = [...new Set(text.toLocaleLowerCase().split(' '))]

    const pinyinToChars = new Map();

    dictionary.forEach(e => {
      const pinyin = e.pinyin[0];
      if (!pinyinToChars.has(pinyin)) {
        pinyinToChars.set(pinyin, []);
      }
      pinyinToChars.get(pinyin).push(e.character);
    });

    uniqueChars.forEach(pinyin => {
      const chars = pinyinToChars.get(pinyin);
      if (chars) {
        chars.forEach(char => {
          filterChars.push(char);
          filterPinyin.push(pinyin);  
        })
      }
    });

    if(!filterChars.length) return

    setFilterText(filterChars)
    setPinyin(filterPinyin)
  }



  const resetAutoDraw = () => {
    setTimeout(() => {
      setIsReDraw(false)
    }, 10000); 
  }

  const handleReload = () => {
    if(!handleCodePoints(filterText[selected])) return
    setIsReDraw(true)
    objRef.current.data = `./svgs/${handleCodePoints(filterText[selected])}.svg`
    resetAutoDraw()
  } 

  const handleSpeak = async() => {
    // https://proxy.junookyo.workers.dev/?language=cmn-Hant-TW&text=%E4%BD%A0%E5%A5%BD&speed=1
    const checkAudio = document.querySelectorAll("audio.speak")
    if(checkAudio.length > 0) {checkAudio.forEach(e => e.remove())}
    const audio = document.createElement('audio');
    audio.src = `https://proxy.junookyo.workers.dev/?language=cmn-Hant-TW&text=${filterText[selected]}&speed=0.1`
    audio.style.display = "none"
    audio.classList.add("speak")
    document.body.appendChild(audio)


    const playWithSleep = async () => {
      await audio.play();
  
      audio.onended = async () => {
        if (isLoop) {
          await sleep(1000); 
          playWithSleep();
        } else {
          audio.remove(); 
        }
      };
    };
  
    if (isLoop) {
      playWithSleep(); 
    } else {
      await audio.play();
      audio.onended = () => {
        audio.remove(); 
      }
    }
  }

  const handleChange = () => {
    setText("")
    setIsHanzi(!isHanzi)
  }

  const handleLoop = () => {
    setIsLoop(!isLoop)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      isHanzi ? handleSearch() : handleSearchPinyin()
    }
  };


  return (
    <main className='flex justify-center items-center flex-col gap-4 '>
      <section className="flex gap-2 flex-col">
        <h1 className='text-5xl font-bold text-center'>Hanzi</h1>
        <div className='flex text-xl items-center gap-2'>
          <button className='outline-none' onClick={handleChange}>
            <FaExchangeAlt size={"24px"} className='rotate-90 ' />
          </button>
          <div>
            {isHanzi ? 
              (<input type="text" onKeyDown={handleKeyDown} value={text} onFocus={() => setText("")} onChange={e => setText(e.target.value)} placeholder="Enter Chinese Text" className="p-2 w-80 outline-none border-black border-solid border-2 max-sm:w-72 max-[400px]:w-56" />)
              : (<input type="text" onKeyDown={handleKeyDown} value={text} onFocus={() => setText("")} onChange={e => setText(e.target.value)} placeholder="Enter Pinyin" className="p-2 w-80 outline-none border-black border-solid border-2 max-sm:w-72 max-[400px]:w-56" />)
            }
            <button onClick={isHanzi ? handleSearch : handleSearchPinyin} className='p-2 border-black bg-black text-white border-solid border-2 outline-none'>Search</button>
          </div>
        </div>
        <span className='text-center text-red-600 font-mono text-xs' >Lưu ý: Giới hạn 40 ký tự!!!</span>
      </section>

      
      <section className='flex flex-col gap-4 items-center text-center '>
        <div className='flex flex-row gap-2 justify-center text-xl flex-wrap w-[27rem] max-sm:w-72'>
          {
            filterText.length > 0 && ( 
              filterText.map((t,index) => {
                return <div key={index} onClick={() => setSelected(index)} className={`border-black border-solid border px-2 py-1 cursor-pointer rounded-md ${selected === index ? 'bg-black text-white' : '' }`}>{t}</div>
              })
            )
          }
        </div>
        <div className='w-96 h-96 select-none border-black border-2 rounded-lg pointer-events-none max-sm:w-72 max-sm:h-72 max-[400px]:w-52 max-[400px]:h-52 '>
          {handleCodePoints(filterText[selected]) && (<object type="image/svg+xml" ref={objRef} data={`./svgs/${handleCodePoints(filterText[selected])}.svg`} className='w-full h-full'></object>)}
        </div>
        <div className='text-3xl'>Pinyin: {pinyin[selected]}</div>
        <div className='flex flex-col gap-2'>
          <div className='flex text-4xl justify-center items-center cursor-pointer gap-6'>
            <TbReload onClick={handleReload} />
            <HiMiniSpeakerWave onClick={handleSpeak}/>
          </div>
          <div className='text-3xl'>Loop: 
            <button onClick={handleLoop} className='ml-2 text-xl border outline-none bg-black px-4 py-2 rounded-full text-white'>{isLoop ? "On" : "Off"}</button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
