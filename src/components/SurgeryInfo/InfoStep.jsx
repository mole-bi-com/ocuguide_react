import React, { useState, useRef, useEffect } from 'react';
import './InfoStep.css';

const InfoStep = ({ step, patientInfo, currentCardIndex, setCurrentCardIndex }) => {
  const [playingAudio, setPlayingAudio] = useState(null);
  const [audioCompleted, setAudioCompleted] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [showArrowInstruction, setShowArrowInstruction] = useState(false);
  const audioRef = useRef(null);
  const textRef = useRef(null);
  const textContentRef = useRef(null);

  // Reset audio completion state when card changes
  useEffect(() => {
    setAudioCompleted(false);
    setHighlightIndex(-1);
  }, [currentCardIndex]);

  // Split text into sentences for more precise highlighting
  const splitIntoSentences = (text, caption) => {
    // Start with the caption as the first sentence to be highlighted
    const sentences = [caption];
    
    if (!text || typeof text !== 'string') {
      return sentences;
    }
    
    // Better handling for Korean text which may use different punctuation patterns
    // and often has newlines as sentence breaks
    
    // First split by newlines
    const paragraphs = text.split('\n').filter(p => p.trim());
    
    // For each paragraph, split by sentence-ending punctuation
    paragraphs.forEach(paragraph => {
      if (!paragraph.trim()) return;
      
      // Korean and general punctuation regex pattern
      // Matches sentences ending with ., !, ?, 。, etc.
      const matches = paragraph.match(/[^.!?。]+[.!?。]+/g);
      
      if (matches && matches.length > 0) {
        // Add each sentence found
        matches.forEach(match => {
          if (match.trim()) {
            sentences.push(match.trim());
          }
        });
      } else {
        // If no sentence punctuation found, use the whole paragraph
        sentences.push(paragraph.trim());
      }
    });
    
    return sentences;
  };

  // Handle audio highlighting/karaoke effect with sentence-level highlighting
  useEffect(() => {
    let interval;
    if (playingAudio && textContentRef.current) {
      const caption = step.media.files[currentCardIndex].caption;
      const text = getAudioText(caption);
      const sentences = splitIntoSentences(text, caption);
      
      // Estimate sentence length ratio to assign proportional time to each sentence
      const sentenceLengths = sentences.map(sentence => sentence.length);
      const totalLength = sentenceLengths.reduce((sum, len) => sum + len, 0);
      
      // Calculate time weights - longer sentences get more time
      const timeWeights = sentenceLengths.map(len => len / totalLength);
      
      // Adjust title weight - title generally should get less relative time
      if (sentences.length > 1) {
        // Give titles a minimum weight but scale down very long titles
        const titleAdjustFactor = sentences.length > 3 ? 0.6 : 0.8;
        timeWeights[0] = Math.min(timeWeights[0], timeWeights[0] * titleAdjustFactor);
        
        // Normalize weights after title adjustment
        const sum = timeWeights.reduce((acc, val) => acc + val, 0);
        timeWeights.forEach((_, idx) => {
          timeWeights[idx] = timeWeights[idx] / sum;
        });
      }
      
      // Calculate cumulative progress thresholds for highlighting
      const cumulativeThresholds = [];
      let accum = 0;
      timeWeights.forEach(weight => {
        cumulativeThresholds.push(accum);
        accum += weight;
      });
      
      interval = setInterval(() => {
        if (!audioRef.current || audioRef.current.paused) {
          clearInterval(interval);
          return;
        }
        
        const audioDuration = audioRef.current.duration;
        const currentTime = audioRef.current.currentTime;
        const progress = currentTime / audioDuration;
        
        // Find the current sentence based on cumulative thresholds
        let newIndex = sentences.length - 1; // Default to last sentence
        for (let i = 0; i < cumulativeThresholds.length - 1; i++) {
          if (progress >= cumulativeThresholds[i] && progress < cumulativeThresholds[i+1]) {
            newIndex = i;
            break;
          }
        }
        
        if (newIndex !== highlightIndex) {
          setHighlightIndex(newIndex);
        }
      }, 40); // ~25 fps for smooth transitions
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [playingAudio, currentCardIndex, step.media, highlightIndex]);

  const handleAudioEnd = () => {
    setPlayingAudio(null);
    setAudioCompleted(true);
    setHighlightIndex(-1);
    
    // Show arrow instruction if there are more cards to navigate
    if (currentCardIndex < step.media.files.length - 1) {
      setShowArrowInstruction(true);
      // Auto-hide the instruction after 4 seconds
      setTimeout(() => {
        setShowArrowInstruction(false);
      }, 4000);
    }
    
    // Dispatch a custom event to notify the parent component
    const event = new CustomEvent('audioCompleted', {
      detail: {
        stepId: step.id,
        completed: true,  // This should only be triggered when audio actually completes
        cardIndex: currentCardIndex,
        isLastCard: currentCardIndex === step.media.files.length - 1
      }
    });
    window.dispatchEvent(event);
  };

  const getAudioUrl = (caption) => {
    const audioMap = {
      // 백내장 개요 관련 오디오
      '백내장이란 무엇인가요?': '/assets/audio/kim 1-1.wav',
      '백내장 수술은 어떻게 진행되나요?': '/assets/audio/kim 1-2.wav',
      '백내장 수술시간은 어느정도 되나요?': '/assets/audio/kim 1-3.wav',
      '백내장 수술 시 마취는 어떠한 방식으로 하나요?': '/assets/audio/kim 1-4.wav',
      
      // 인공수정체 결정 관련 오디오
      '인공수정체 기본 원리': '/contents/iol_1.mp3',
      '다초점 인공수정체 (Multifocal)': '/contents/iol_2.mp3',
      '강화 단초점 인공수정체': '/contents/iol_3.mp3',
      '난시교정렌즈 (Toric)와 최종 결정': '/contents/iol_4.mp3',
      
      // 수술 후 시력, 일상생활 관련 오디오
      '백내장 수술 후에는 언제부터 잘 보이게 되나요?': '/contents/q3_1.mp3',
      '백내장 수술 이후 일상생활은 언제부터 가능한가요?': '/contents/q3_2.mp3',
      '백내장 수술 후에는 안약을 얼마나 사용하나요?': '/contents/q3_3.mp3',
      '백내장 수술 후에는 병원에 얼마나 자주 와야하나요?': '/contents/q3_4.mp3',
      
      // 합병증과 부작용 관련 오디오
      '수술 중 합병증': '/contents/complication_1.mp3',
      '수술 후 경미한 부작용': '/contents/complication_2.mp3',
      '수술 후 심한 합병증': '/contents/complication_3.mp3',
      '인공수정체의 탈구/아탈구': '/contents/complication_4.mp3',
      '각막부종': '/contents/complication_5.mp3',
      '후낭혼탁': '/contents/complication_6.mp3'
    };
    return audioMap[caption] || '';
  };

  const playAudio = (audioFile) => {
    const audioUrl = getAudioUrl(audioFile.caption);
    if (playingAudio === audioUrl) {
      audioRef.current.pause();
      setPlayingAudio(null);
      setHighlightIndex(-1);
    } else {
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        
        // Add preload and wait for audio to be loaded before playing
        audioRef.current.load();
        
        // When metadata is loaded, we can start playing
        audioRef.current.onloadedmetadata = () => {
          audioRef.current.play().then(() => {
            setPlayingAudio(audioUrl);
            setHighlightIndex(0);
            
            // Clear the event to prevent memory leaks
            audioRef.current.onloadedmetadata = null;
          }).catch(error => {
            console.error("Error playing audio:", error);
          });
        };
      }
    }
  };

  const getAudioText = (caption) => {
    const textMap = {
      // 백내장 개요 관련 텍스트
      '백내장이란 무엇인가요?': `백내장이란 노화에 의해 '카메라의 렌즈에 해당하는 수정체'에 혼탁이 생기는 것입니다.
현재로서는 백내장을 치료할 수 있는 약제는 없으며, 따라서 백내장은 반드시 수술적 치료를 해야하는 질환입니다.`,

      '백내장 수술은 어떻게 진행되나요?': `백내장 수술은 다음과 같은 2가지 과정으로 이루어집니다.
1) 백내장이 생긴 혼탁해진 수정체를 제거합니다.
2) 수정체 역할을 대신할 인공수정체를 넣습니다.`,

      '백내장 수술시간은 어느정도 되나요?': `평균적으로 약 20~30분 정도 소요되나, 수술의 난도가 높거나 수술 중 합병증이 발생하면 더 길어질 수 있습니다.`,

      '백내장 수술 시 마취는 어떠한 방식으로 하나요?': `일반적으로 안약을 통한 점안 마취 및 국소마취로 진행됩니다.
예외적으로 협조가 어려운 환자의 경우에는 전신마취로 진행해야 할 수 있습니다.
수술 중에는 최대한 움직이지 않아야 합니다.
눈을 가만히 있기 어렵거나, 30분 정도 누워있기어려운 경우, 또는 폐쇄공포증이 있는 경우에는 주치의에게 꼭 말씀해주시길 바랍니다.`,

      // 인공수정체 결정 관련 텍스트
      '인공수정체 기본 원리': `자연적인 수정체는 거리에 따라 자동으로 초점을 맞추어 주는 조절력이 있습니다.
백내장 수술 시 삽입되는 인공수정체는 자연적인 수정체와는 달리 이러한 조절력이 없습니다.
따라서, 백내장 수술을 하게 되면 원거리나 근거리 중 한 곳에만 초점을 맺게 됩니다.
일반적으로, 원거리가 잘 보이도록 인공수정체를 삽입하게 되며, 이 경우 근거리를 볼 때는 안경 착용이 필요합니다.
근거리 작업이 많은 경우 근거리가 잘 보이도록 하는 것도 가능합니다.
최근에는 이러한 단점을 보완한 새로운 인공수정체들이 사용되고 있습니다.`,

      '다초점 인공수정체 (Multifocal)': `다초점 인공수정체는 원거리와 근거리(30cm) 모두를 선명하게 볼 수 있도록 설계된 첨단 인공수정체입니다.
이 렌즈는 여러 초점을 갖고 있어 독서나 컴퓨터 작업 등 근거리 시야와 운전이나 TV 시청 등 원거리 시야를 모두 개선합니다.
주로 노안 교정에 효과적이나, 야간 빛번짐이나 후광 현상 등의 부작용이 있을 수 있습니다.
녹내장이나 황반변성 등 시신경이나 망막에 이상이 있는 환자에게는 권장되지 않습니다.`,

      '강화 단초점 인공수정체': `강화 단초점 인공수정체는 기존 단초점 렌즈보다 중간거리(50cm)에서의 시야를 크게 개선한 차세대 렌즈입니다.
이 렌즈는 컴퓨터나 스마트폰 사용 시 더 편안한 시야를 제공하며, 일상생활에서 안경 의존도를 줄여줍니다.
다초점 인공수정체에 비해 부작용이 현저히 적으며, 야간 시야 장애나 빛번짐이 거의 없습니다.
다만 정밀한 근거리 작업 시에는 여전히 돋보기나 근거리용 안경이 필요할 수 있습니다.`,

      '난시교정렌즈 (Toric)와 최종 결정': `난시교정렌즈(Toric)는 기존의 난시를 동시에 교정할 수 있는 특수 설계된 인공수정체입니다.
이 렌즈는 백내장과 난시를 한 번의 수술로 모두 해결할 수 있어, 수술 후 더욱 선명하고 깨끗한 시야를 제공합니다.
수술 후 인공수정체의 교체는 매우 어려우며 위험을 동반하므로, 환자의 연령, 생활 패턴, 눈의 상태를 종합적으로 고려한 신중한 선택이 필요합니다.
반드시 주치의와 충분한 상담을 통해 개인에게 가장 적합한 인공수정체를 결정하시기 바랍니다.`,

      // 수술 후 시력, 일상생활 관련 텍스트
      '백내장 수술 후에는 언제부터 잘 보이게 되나요?': `수술 직후나 다음날부터 잘 보이는 경우도 있으나 각막 부종 등으로 오히려 일시적으로 시력이 떨어질 수도 있습니다. 일반적으로 1~2주간의 회복기를 거치며 서서히 시력이 호전됩니다. 수술 후 1~2달 정도 뒤에 최종적으로 정확한 시력 및 도수를 알 수 있습니다. 안경이 필요할 경우 이 시기에 처방을 받으시면 됩니다. 망막질환, 녹내장 등 기저 안질환이 동반되어 있는 경우에는 시력 회복이 제한될 수 있습니다.`,

      '백내장 수술 이후 일상생활은 언제부터 가능한가요?': `백내장 수술 당일부터 가벼운 일상 생활이 가능하며 식사에도 제약이 없습니다. 다만, 과도한 운동이나 심하게 고개를 숙이는 자세 등은 삼가야 합니다. 세수와 샤워는 일주일 뒤부터 가능하며, 수영장이나 목욕탕 이용은 한달 뒤부터 가능합니다.`,

      '백내장 수술 후에는 안약을 얼마나 사용하나요?': `일반적으로 수술 후에는 항생제, 항염증제 등 안약을 1~2달간 사용하게 됩니다. 회복 경과에 따라 안약을 더 오래 사용해야 하거나 추가해야 할 수 있습니다.`,

      '백내장 수술 후에는 병원에 얼마나 자주 와야하나요?': `특별한 문제가 없다면 수술일 기준 다음날, 1주일, 1개월, 3-6개월 주기로 내원하게 됩니다.`,

      // 합병증과 부작용 관련 텍스트
      '수술 중 합병증': `백내장 수술의 부작용은 크게 '수술 중 합병증'과 '수술 후 부작용/합병증' 으로 나눌 수 있습니다.
수술 중 합병증 중 가장 중요한 것은 후낭파열과 유리체 탈출입니다.
백내장 수술과정의 약 5%에서 나타날 수 있으며, 특히 난도가 높은 백내장 수술에서 발생 확률이 증가합니다.
이러한 경우에는 유리체절제술이라는 추가 수술이 필요할 수 있으며, 삽입되는 인공수정체의 종류나 위치가 달라질 수 있습니다.`,

      '수술 후 경미한 부작용': `경미한 수술 부작용으로는 건조증, 이물감, 눈주변 불편감, 결막하출혈 등이 있습니다.
건조증은 수술 후 일시적으로 악화될 수 있으나 대부분 시간이 지나면서 호전됩니다.
하지만 수술 전 건조증이 심했던 경우, 증상이 심해지거나 오랜 기간 지속될 수 있습니다.
결막하출혈은 자연스럽게 나타나며 2-4주 안에 자연소멸됩니다.
비문증(날파리증) 또한 흔한 부작용 중 하나이며, 수술 이후 이로 인한 불편감이 나타날 수 있습니다.`,

      '수술 후 심한 합병증': `가장 심각한 부작용으로는 수술 후 감염이 있으며 1/1000 확률로 발생한다고 알려져 있습니다.
이를 예방하기 위하여 수술 후 주의사항을 반드시 숙지하시기 바랍니다.
수술 후 갑작스런 시력저하, 통증, 심한충혈 발생시, 감염의 초기 증상일 수 있으므로 즉시 내원하셔야 합니다.
수술 후 감염 발생시에는 반복적인 안구내주사 혹은 재수술(유리체절제술)이 필요할 수 있습니다.
이외에도 백내장 수술 이후 안검하수, 복시, 망막박리 등의 합병증이 발생할 수 있습니다.`,

      '인공수정체의 탈구/아탈구': `인공수정체의 탈구/아탈구는 수술 후 장기적인 합병증 중 하나입니다.
인공수정체가 기존의 위치에서 이탈되는 것을 뜻하며, 백내장 수술 이후 발생할 수 있는 장기적인 합병증입니다.
인공수정체를 지지해주는 역할을 하는 소대라는 구조가 약한 경우 발생할 가능성이 높습니다.
인공수정체가 탈구/아탈구된 경우에는 재수술(유리체절제술 및 이차적 인공수정체 삽입술)이 필요하게 됩니다.`,

      '각막부종': `각막부종은 수술 직후에도 일시적으로 발생할 수 있으나, 수술 전 각막내피세포가 좋지 않은 경우 오래 지속될 수 있습니다.
각막부종이 장기간 지속되면 시력회복이 더딜 수 있으며, 호전되지 않는 경우에는 각막이식술이 필요할 수 있습니다.`,

      '후낭혼탁': `후낭혼탁은 인공수정체가 들어있는 주머니 구조에 혼탁이 생기는 것으로, 후발백내장이라고도 합니다.
이는 수술 이후에 자연스럽게 생길 수 있는 합병증으로 재수술이 아닌 간단한 'YAG 레이져 시술'을 통해 제거할 수 있습니다.`
    };
    return textMap[caption] || '답변 준비 중입니다.';
  };

  const handleNextCard = () => {
    if (step.media && step.media.files && currentCardIndex < step.media.files.length - 1) {
      const nextCardIndex = currentCardIndex + 1;
      setCurrentCardIndex(nextCardIndex);
      setPlayingAudio(null);
      setAudioCompleted(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      // Remove the automatic event dispatch here - we only want audio completion
      // to trigger when the audio actually finishes playing
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setPlayingAudio(null);
      setAudioCompleted(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  };

  // Render text content with proper formatting
  const renderTextContent = (content) => {
    return (
      <div className="text-content">
        {content.map((text, index) => (
          <p key={index}>{text}</p>
        ))}
      </div>
    );
  };

  const renderMedia = () => {
    if (!step.media) return null;

    switch (step.media.type) {
      case 'text':
        // Check if it's a simple text content or multi-card text content
        if (step.media.files && Array.isArray(step.media.files)) {
          // This is a multi-card text content
          if (step.media.files.length === 0) {
            return <p>정보를 불러올 수 없습니다.</p>;
          }
          
          const currentText = step.media.files[currentCardIndex];
          if (!currentText) return null;
          
          const showNavigation = step.media.files.length > 1;
          
          return (
            <div className="audio-content-wrapper">
              <div className="audio-item-container">
                {showNavigation && (
                  <button
                    onClick={handlePrevCard}
                    disabled={currentCardIndex === 0}
                    className="card-arrow prev-arrow"
                    aria-label="Previous Card"
                  >
                    <span className="material-icons">chevron_left</span>
                  </button>
                )}

                <div className="audio-item">
                  <div className="audio-item-header">
                    <span className="audio-number">{`${currentCardIndex + 1}/${step.media.files.length}`}</span>
                    <p className="audio-caption">{currentText.caption}</p>
                  </div>
                  
                  <div className="audio-text-container text-content-container">
                    {renderTextContent(currentText.content)}
                  </div>
                </div>

                {showNavigation && (
                  <button
                    onClick={handleNextCard}
                    disabled={currentCardIndex === step.media.files.length - 1}
                    className="card-arrow next-arrow"
                    aria-label="Next Card"
                  >
                    <span className="material-icons">chevron_right</span>
                  </button>
                )}
              </div>
            </div>
          );
        } else {
          // Simple text content
          return renderTextContent(step.media.content);
        }
      case 'audio':
        if (!step.media.files || !Array.isArray(step.media.files) || step.media.files.length === 0) {
          return <p>정보를 불러올 수 없습니다.</p>;
        }
        const currentAudio = step.media.files[currentCardIndex];
        if (!currentAudio) return null;

        const showNavigation = step.media.files.length > 1;
        const caption = currentAudio.caption;
        const audioText = getAudioText(caption);
        const sentences = splitIntoSentences(audioText, caption);

        return (
          <div className="audio-content-wrapper">
            <div className="audio-item-container">
              {showNavigation && (
                <button
                  onClick={handlePrevCard}
                  disabled={currentCardIndex === 0}
                  className="card-arrow prev-arrow"
                  aria-label="Previous Card"
                >
                  <span className="material-icons">chevron_left</span>
                </button>
              )}

              <div className="audio-item">
                <div className="audio-item-header">
                  <span className="audio-number">{`${currentCardIndex + 1}/${step.media.files.length}`}</span>
                  <p className={`audio-caption ${highlightIndex === 0 ? 'highlight-caption' : ''}`}>{caption}</p>
                  
                  {/* Listen button moved to the top */}
                  <div className="audio-button-top">
                    <button
                      onClick={() => playAudio(currentAudio)}
                      className={`audio-button ${playingAudio === getAudioUrl(caption) ? 'playing' : ''} ${audioCompleted ? 'completed' : ''}`}
                    >
                      {playingAudio === getAudioUrl(caption) ? (
                        <>
                          <span className="material-icons">pause</span>
                          정지
                        </>
                      ) : audioCompleted ? (
                        <>
                          <span className="material-icons">check</span>
                          완료됨
                        </>
                      ) : (
                        <>
                          <span className="material-icons">play_arrow</span>
                          듣기
                        </>
                      )}
                    </button>
                    {audioCompleted && (
                      <div className="audio-completed-message">
                        {currentCardIndex === step.media.files.length - 1 
                          ? "듣기를 완료했습니다. 아래 파란색 다음 단계 버튼을 눌러주세요."
                          : "듣기를 완료했습니다."}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="audio-text-container" ref={textContentRef}>
                  <div className="audio-text karaoke-text" ref={textRef}>
                    {sentences.slice(1).map((sentence, idx) => (
                      <span 
                        key={idx} 
                        className={highlightIndex === idx + 1 ? 'highlight-text' : ''}
                      >
                        {sentence}{' '}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {showNavigation && (
                <button
                  onClick={handleNextCard}
                  disabled={currentCardIndex === step.media.files.length - 1 || (step.media.type === 'audio' && !audioCompleted && currentCardIndex < step.media.files.length - 1)}
                  className={`card-arrow next-arrow ${audioCompleted && currentCardIndex < step.media.files.length - 1 ? 'completed-arrow' : ''}`}
                  aria-label="Next Card"
                >
                  <span className="material-icons">chevron_right</span>
                  {audioCompleted && currentCardIndex < step.media.files.length - 1 && (
                    <>
                      <div className="arrow-popup-message">
                        다음으로 →
                      </div>
                      <div className="arrow-breathing-dot"></div>
                    </>
                  )}
                </button>
              )}
            </div>

            <audio
              ref={audioRef}
              onEnded={handleAudioEnd}
              style={{ display: 'none' }}
            />
            {step.media.video && currentCardIndex === step.media.files.length - 1 && (
              <div className="video-content">
                <h4>백내장 수술 영상</h4>
                <div className="video-wrapper">
                  <iframe
                    src={step.media.video.url}
                    width="100%"
                    height="250px"
                    frameBorder="0"
                    allowFullScreen
                    title={step.media.video.caption || '백내장 수술 영상'}
                  />
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="info-step">
      <div className="info-step-header">
        <h2>{step.title}</h2>
        <p className="step-description">{step.content}</p>
      </div>
      {renderMedia()}
      
      {/* Arrow instruction overlay */}
      {showArrowInstruction && (
        <div className="arrow-instruction-overlay" onClick={() => setShowArrowInstruction(false)}>
          <div className="arrow-instruction-content">
            <h3>듣기 완료!</h3>
            <p>오른쪽 화살표를 클릭하여<br/>다음 내용으로 이동하세요</p>
            <div className="arrow-demo">→</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoStep; 