import { useState } from 'react';

const initialDraft = {
  question: '',
  options: ['', '', ''],
  answerIndex: 0,
};

function App() {
  const [page, setPage] = useState('intro');
  const [questions, setQuestions] = useState([]);
  const [draft, setDraft] = useState(initialDraft);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [score, setScore] = useState(0);

  const [popupMessage, setPopupMessage] = useState('');

  const currentQuestion = questions[currentIndex];

  function goIntro() {
    setPage('intro');
    setCurrentIndex(0);
    setSelectedIndex(null);
    setScore(0);
  }

  function startQuiz() {
    if (questions.length === 0) {
      setPopupMessage('문제지를 먼저 설정한 뒤 \n 실행해주세요.');
      return;
    }

    setCurrentIndex(0);
    setSelectedIndex(null);
    setScore(0);
    setPage('quiz');
  }

  function updateQuestion(value) {
    setDraft((prev) => ({
      ...prev,
      question: value,
    }));
  }

  function updateOption(optionIndex, value) {
    setDraft((prev) => {
      const nextOptions = [...prev.options];
      nextOptions[optionIndex] = value;

      return {
        ...prev,
        options: nextOptions,
      };
    });
  }

  function selectAnswer(answerIndex) {
    setDraft((prev) => ({
      ...prev,
      answerIndex,
    }));
  }

  function addQuestion() {
    const trimmedQuestion = draft.question.trim();
    const trimmedOptions = draft.options.map((option) => option.trim());

    if (!trimmedQuestion) {
      setPopupMessage('질문을 입력해주세요.');
      return;
    }

    if (trimmedOptions.some((option) => !option)) {
      setPopupMessage('보기 1, 2, 3을 모두 입력해주세요.');
      return;
    }

    const newQuestion = {
      id: crypto.randomUUID(),
      question: trimmedQuestion,
      options: trimmedOptions,
      answerIndex: draft.answerIndex,
    };

    setQuestions((prev) => [...prev, newQuestion]);
    setDraft(initialDraft);
    setPopupMessage('문제가 추가됐어요.');
  }

  function saveQuestions() {
    if (questions.length === 0) {
      setPopupMessage('저장할 문제가 없어요. \n 문제를 먼저 추가해주세요.');
      return;
    }

    setPopupMessage('문제지가 저장됐어요. \n 이제 퀴즈를 시작할 수 있어요.');
  }

  function handleNextQuestion() {
    if (selectedIndex === null) {
      setPopupMessage('답을 먼저 선택해주세요.');
      return;
    }

    const isCorrect = selectedIndex === currentQuestion.answerIndex;
    const nextScore = isCorrect ? score + 1 : score;
    setScore(nextScore);

    const isLastQuestion = currentIndex === questions.length - 1;

    if (isLastQuestion) {
      setPage('result');
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedIndex(null);
  }

  function retryQuiz() {
    setCurrentIndex(0);
    setSelectedIndex(null);
    setScore(0);
    setPage('quiz');
  }

  const resultMessage = getResultMessage(score, questions.length);

  return (
    <div className="app">
      {page === 'intro' && (
        <section className="screen intro-screen">
          <button
            className="intro-hit-btn intro-start-hit"
            onClick={startQuiz}
            aria-label="퀴즈풀기"
          />

          <button
            className="intro-hit-btn intro-setting-hit"
            onClick={() => setPage('setting')}
            aria-label="문제 만들기"
          />
        </section>
      )}

      {page === 'quiz' && currentQuestion && (
        <section className="screen quiz-screen">
          <button
            className="image-back-btn main-back-btn"
            onClick={goIntro}
            aria-label="처음으로 돌아가기"
          />

          <h1 className="page-title"></h1>

          <div className="question-card">
            <p className="question-number">Q{currentIndex + 1}</p>
            <p className="question-text">{currentQuestion.question}</p>
          </div>

          <div className="score-row">
            <span>
              {currentIndex + 1} / {questions.length}
            </span>
            <span>현재 점수 {score}점</span>
          </div>

          <div className="answer-list">
            {currentQuestion.options.map((option, index) => (
              <button
                key={`${option}-${index}`}
                className={`answer-btn answer-${index + 1} ${selectedIndex === index ? 'is-selected' : ''
                  }`}
                onClick={() => setSelectedIndex(index)}
              >
                <span>{index + 1}.</span>
                <span>{option}</span>
              </button>
            ))}
          </div>

          <button className="next-btn" onClick={handleNextQuestion}>
            {currentIndex === questions.length - 1 ? '결과보기' : '다음문제'}
          </button>

        </section>
      )}

      {page === 'setting' && (
        <section className="screen pink-screen setting-screen">
          <button
            className="image-back-btn quiz-back-btn"
            onClick={goIntro}
            aria-label="뒤로가기"
          />

          <h1 className="page-title"></h1>

          <div className="setting-card">
            <p className="setting-label">질문</p>
            <input
              className="setting-input question-input"
              value={draft.question}
              onChange={(event) => updateQuestion(event.target.value)}
              placeholder="내가 제일 좋아하는 음식은?"
            />

            {draft.options.map((option, index) => (
              <label className="setting-field" key={index}>
                <span>정답 {index + 1}</span>
                <input
                  className="setting-input"
                  value={option}
                  onChange={(event) => updateOption(index, event.target.value)}
                  placeholder={['엽떡', '마라탕', '닭발'][index]}
                />
              </label>
            ))}

            <p className="setting-label">정답 선택</p>
            <div className="answer-choice-row">
              {draft.options.map((_, index) => (
                <button
                  key={index}
                  className={`choice-btn ${draft.answerIndex === index ? 'is-active' : ''
                    }`}
                  onClick={() => selectAnswer(index)}
                >
                  정답 {index + 1}
                </button>
              ))}
            </div>

            {questions.length > 0 && (
              <p className="saved-count">저장된 문제 {questions.length}개</p>
            )}
          </div>

          <div className="setting-actions">
            <button
              className="setting-image-btn add-btn"
              onClick={addQuestion}
              aria-label="문제추가"
            />

            <button
              className="setting-image-btn save-btn"
              onClick={saveQuestions}
              aria-label="저장하기"
            />
          </div>

          <button className="start-btn" onClick={startQuiz}>
            퀴즈 시작하러 가기
          </button>
        </section>
      )}

      {page === 'result' && (
        <section className="screen pink-screen result-screen">
          <h1 className="page-title"></h1>

          <div className="result-card">
            <p className="result-title">결과발표</p>
            <div className="divider" />

            <p className="result-small">내 점수는</p>
            <p className="result-score">
              {score} / {questions.length}
            </p>

            <p className="result-message">{resultMessage.title}</p>
            <p className="result-desc">{resultMessage.desc}</p>

            <p className="result-count">
              정답 {score}개 · 오답 {questions.length - score}개
            </p>
          </div>

          <div className="result-actions">
            <button
              className="result-image-btn again-btn"
              onClick={retryQuiz}
              aria-label="다시풀기"
            />

            <button
              className="result-image-btn backtomain-btn"
              onClick={goIntro}
              aria-label="처음으로"
            />

            <button
              className="result-image-btn link-btn"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: '커플력 테스트',
                    text: `커플력 테스트 결과! 내 점수는 ${score} / ${questions.length}점`,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  setPopupMessage('링크가 복사됐어요.');
                }
              }}
              aria-label="공유하기"
            />
          </div>
        </section>
      )}

      {popupMessage && (
        <div className="popup-dim">
          <div className="popup">
            <p>{popupMessage}</p>
            <button onClick={() => setPopupMessage('')}>확인</button>
          </div>
        </div>
      )}
    </div>
  );
}

function getResultMessage(score, total) {
  if (total === 0) {
    return {
      title: '아직 결과가 없어요!',
      desc: '문제를 만든 뒤 퀴즈를 풀어주세요.',
    };
  }

  const ratio = score / total;

  if (ratio === 1) {
    return {
      title: '완벽해요!',
      desc: '거의 나보다 나를 더 잘 아는 수준이에요.',
    };
  }

  if (ratio >= 0.8) {
    return {
      title: '정말 잘 알고 있군요!',
      desc: '사소한 것까지 기억하는 센스가 있어요.',
    };
  }

  if (ratio >= 0.5) {
    return {
      title: '나쁘지 않아요!',
      desc: '조금만 더 알면 완벽한 커플력 가능.',
    };
  }

  if (ratio > 0) {
    return {
      title: '아직 알아갈 게 많아요',
      desc: '오늘부터 취향 노트 작성 들어갑니다.',
    };
  }

  return {
    title: '대위기 발생!',
    desc: '지금 바로 대화 시간이 필요합니다.',
  };
}

export default App;
