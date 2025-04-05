import React, { useState, useRef } from 'react';
import './InfoStep.css';

const InfoStep = ({ step }) => {
  const [playingAudio, setPlayingAudio] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const audioRef = useRef(null);

  const handleAudioEnd = () => {
    setPlayingAudio(null);
  };

  const getAudioUrl = (caption) => {
    const audioMap = {
      '백내장이란 무엇인가요?': '/contents/q1_1.mp3',
      '백내장 수술은 어떻게 진행되나요?': '/contents/q1_2.mp3',
      '백내장 수술 시 마취는 어떠한 방식으로 하나요?': '/contents/q1_3.mp3',
      '백내장 수술 입원은 며칠 동안 하나요?': '/contents/q1_4.mp3',
      '백내장 수술시 눈의 도수는 어떻게 되나요?': '/contents/q2_1.mp3',
      '백내장 수술시 넣을 수 있는 인공수정체의 종류에는 어떤 것이 있나요?': '/contents/q3_1.mp3',
      '백내장 수술 후에는 바로 잘 보이게 되나요?': '/contents/q3_2.mp3',
      '백내장 수술 이후 일상생활은 언제부터 가능한가요?': '/contents/q3_3.mp3',
      '백내장 수술 후에는 안약을 얼마나 사용하나요?': '/contents/q3_4.mp3',
      '백내장 수술 후에는 병원에 얼마나 자주 와야하나요?': '/contents/q4_1.mp3',
      '백내장 수술의 부작용에는 어떤 것들이 있나요?': '/contents/q5_1.mp3',
      '양쪽 눈을 동시에 수술이 가능한가요?': '/contents/q5_2.mp3',
      '수술 당일에는 어떻게 준비해야 하나요?': '/contents/q5_3.mp3',
      '백내장 수술 전에 복용하지 말아야 할 약제가 있을까요?': '/contents/q5_4.mp3'
    };
    return audioMap[caption] || '';
  };

  const playAudio = (audioFile) => {
    const audioUrl = getAudioUrl(audioFile.caption);
    if (playingAudio === audioUrl) {
      audioRef.current.pause();
      setPlayingAudio(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setPlayingAudio(audioUrl);
      }
    }
  };

  const getAudioText = (caption) => {
    const textMap = {
      '백내장이란 무엇인가요?': `백내장이란 노화에 의해 '카메라의 렌즈에 해당하는 수정체'에 혼탁이 생기는 것입니다.
현재로서는 백내장을 치료할 수 있는 약제는 없으며, 따라서 백내장은 반드시 수술적 치료를 해야하는 질환입니다.`,

      '백내장 수술은 어떻게 진행되나요?': `백내장 수술은 다음과 같은 2가지 과정으로 이루어집니다.
1) 혼탁해진 백내장을 제거하고 (Phacoemulsification)
2) 수정체 역할을 대신할 인공수정체(=렌즈)를 넣는 것 (IOL implantation)`,

      '백내장 수술 시 마취는 어떠한 방식으로 하나요?': `일반적으로 점안 마취 및 국소마취로 진행됩니다.
예외적으로 협조가 어려운 환자의 경우에는 전신마취로 진행하게 됩니다.
폐쇄공포증이 있거나, 30분 정도 가만히 누워 계시기나 어렵거나, 눈을 가만히 있기가 어려운 분들은 사전에 주치의에게 꼭 말씀해주시길 바랍니다.`,

      '백내장 수술 입원은 며칠 동안 하나요?': `백내장 수술은 일일입원(당일 입원, 당일 퇴원)으로 진행됩니다.
당일 내원시간은 전날에 전화 및 문자메세지로 안내해드리니 전화를 잘 받아주시기 바랍니다.
일반적으로 수술 1-2시간 전에 도착하여 산동제를 점안하기 시작하며, 산동이 충분히 된 후에 수술을 진행하게 됩니다.`,

      '백내장 수술시 눈의 도수는 어떻게 되나요?': `사람의 눈은 원래 수정체의 두께를 조절하여 먼거리와 근거리를 모두 잘 볼 수 있으며, 이러한 기능이 떨어져 일반적으로 가까운 거리를 잘 못보게 되는 것을 '노안'이라고 합니다.
백내장 수술 후에는 이러한 조절력이 사라지기에 눈이 단초점 상태가 되어, 먼거리와 근거리 중 하나만 잘 볼 수 있게 됩니다.
예외적으로 다초점렌즈를 넣게 되면 먼거리와 근거리를 모두 잘 볼 수 있게 됩니다.`,

      '백내장 수술시 넣을 수 있는 인공수정체의 종류에는 어떤 것이 있나요?': `1) 일반 렌즈
2) 다초점렌즈 (Multifocal) - 먼거리와 가까운거리(30cm)를 둘 다 잘 보이게 하는 장점이 있어 노안교정을 원하시는 분들에게 추천드릴 수 있지만, 부작용으로 빛번짐, 시야흐림 등이 나타날 수 있습니다.
3) 아이헨스렌즈 (Eyhance) - 다초점렌즈의 부작용은 없으면서 먼거리와 중간거리(50cm)을 잘 보이게 하는 렌즈입니다.
4) 난시교정렌즈 (Toric) - 난시가 심한 경우 난시교정렌즈를 고려할 수 있습니다.`,

      '백내장 수술 후에는 바로 잘 보이게 되나요?': `백내장 수술 후 1~2달 정도 뒤에 정확한 도수 및 시력이 나오게 됩니다.
일반적으로 이 때, 안경검사를 진행하고 필요하면 돋보기를 처방하게 됩니다.
수술 직후에는 각막 부종 등으로 오히려 시력이 떨어질 수 있습니다.
망막질환, 녹내장 등 기저 안질환이 동반되어 있는 경우에는 시력 회복이 제한될 가능성이 있습니다.`,

      '백내장 수술 이후 일상생활은 언제부터 가능한가요?': `백내장 수술 당일부터 일상 생활은 가능합니다. (식사에도 제약은 없습니다.)
다만, 세수와 샤워는 일주일 뒤부터 가능합니다.`,

      '백내장 수술 후에는 안약을 얼마나 사용하나요?': `일반적으로 수술 후에는 항생제, 항염증제 등 안약을 약 한달 간 사용하게 됩니다.
다만, 필요에 따라서 안약을 추가하거나 더 오래 사용하게 될 수 있습니다.`,

      '백내장 수술 후에는 병원에 얼마나 자주 와야하나요?': `수술일 기준 다음날, 1주일, 1개월, 3-6개월 주기로 내원하게 됩니다.
다만 필요에 따라서 조금 이른 주기로 경과관찰하게 될 수 있습니다.`,

      '백내장 수술의 부작용에는 어떤 것들이 있나요?': `백내장 수술의 부작용은 크게 '수술 중 합병증'과 '수술 후 부작용/합병증'으로 나눌 수 있습니다.

1) 수술 중 합병증
- 백내장 수술 도중 발생할 수 있는 합병증은 여러가지가 있으나 가장 중요한 합병증은 후낭파열과 유리체손실입니다.
- 이는 백내장 수술과정의 약 5%에서 나타날 수 있는 수술 중 합병증이며, 특히 난이도가 높은 백내장 수술에서 확률이 증가합니다.

2) 수술 후 경미한 부작용
- 건조증, 이물감, 비특이적인 눈주변 불편감, 충혈, 결막하출혈 등이 있습니다.
- 수술 후 충혈 및 결막하출혈은 자연스럽게 나타나며 2-4주 안에 자연소멸됩니다.

3) 수술 후 심한 합병증
- 가장 심각한 부작용으로는 수술 후 감염이 있으며, 1/1000 확률로 발생합니다.
- 수술 후 갑작스런 시력저하, 통증, 심한충혈 발생시, 감염의 초기 증상일 수 있으므로 즉시 내원하셔야 합니다.`,

      '양쪽 눈을 동시에 수술이 가능한가요?': `일반적으로 한 눈씩 진행하지만, 원하면 한 번에 양안 수술이 가능하기도 합니다.
그러나 대부분은 한쪽 눈 수술 경과를 보며 반대쪽 눈 수술을 결정하게 됩니다.
다만, 전신마취로 하는 경우에는 양안을 동시에 수술하게 됩니다.`,

      '수술 당일에는 어떻게 준비해야 하나요?': `보통 수술 전날 오전에 내원시간 및 장소에 대한 안내가 유선으로 진행되기에, 전화를 잘 받아주시기 바랍니다. 안내 문자도 함께 보내드립니다.
수술안이 충분히 산동되어야 잘 진행될 수 있기에, 보통 수술 1~2시간 전에 도착하여 산동제를 점안하게 됩니다.
수술 이후에는 간호사의 설명을 들은 후에, 퇴원약이 준비되는 대로 바로 퇴원 가능합니다.`,

      '백내장 수술 전에 복용하지 말아야 할 약제가 있을까요?': `일반적으로 피가 많이나는 수술은 아니기에 항혈소판제, 항응고제는 유지하며 수술합니다.
수술 당일 아침까지 복용하셔도 됩니다.
전립선 약제를 복용하는 경우 동공확대를 저하시켜, 수술 난이도가 높아질 수 있습니다.
다만 모든 약제는 수술 전 주치의와 상의 후 복용하셔야 합니다.`
    };
    return textMap[caption] || '답변 준비 중입니다.';
  };

  const handleNextCard = () => {
    if (step.media && step.media.files && currentCardIndex < step.media.files.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setPlayingAudio(null);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setPlayingAudio(null);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  };

  const renderMedia = () => {
    if (!step.media) return null;

    switch (step.media.type) {
      case 'text':
        return (
          <div className="text-content">
            {step.media.content.map((text, index) => (
              <p key={index}>{text}</p>
            ))}
          </div>
        );
      case 'audio':
        if (!step.media.files || !Array.isArray(step.media.files) || step.media.files.length === 0) {
          return <p>정보를 불러올 수 없습니다.</p>;
        }
        const currentAudio = step.media.files[currentCardIndex];
        if (!currentAudio) return null;

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
                  <p className="audio-caption">{currentAudio.caption}</p>
                </div>
                <p className="audio-text">{getAudioText(currentAudio.caption)}</p>
                <div className="audio-button-wrapper">
                  <button
                    onClick={() => playAudio(currentAudio)}
                    className={`audio-button ${playingAudio === getAudioUrl(currentAudio.caption) ? 'playing' : ''}`}
                  >
                    {playingAudio === getAudioUrl(currentAudio.caption) ? (
                      <>
                        <span className="material-icons">pause</span>
                        정지
                      </>
                    ) : (
                      <>
                        <span className="material-icons">play_arrow</span>
                        듣기
                      </>
                    )}
                  </button>
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
                    height="315"
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
    </div>
  );
};

export default InfoStep; 