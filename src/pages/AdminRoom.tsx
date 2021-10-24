import { useHistory, useParams } from 'react-router';
import logoImg from '../assets/images/logo.svg';
import deleteImg from '../assets/images/delete.svg';
import checkImg from '../assets/images/check.svg';
import answerImg from '../assets/images/answer.svg';
import { Button } from '../components/Button';
import { Question } from '../components/Question';
import { RoomCode } from '../components/RoomCode';
import { useRoom } from '../hooks/useRoom';

import '../styles/room.scss';
import { ref, remove, update } from '@firebase/database';
import { database } from '../services/firebase';

type Params = {
    id: string;
}

export function AdminRoom() {
    const history = useHistory();
    const params = useParams<Params>();

    const roomId = params.id;

    const { questions, title } = useRoom(roomId);

    async function handleRemoveQuestion(questionId: string) {
        if (window.confirm('Tem certeza que deseja excluir esta pergunta?')) {
            await remove(ref(database, `rooms/${roomId}/questions/${questionId}`));
        }
    }

    async function handleCheckQuestionAsAnswered(questionId: string) {
        await update(ref(database, `rooms/${roomId}/questions/${questionId}`), { isAnswered: true });
    }

    async function handleHighlightQuestion(questionId: string) {
        await update(ref(database, `rooms/${roomId}/questions/${questionId}`), { isHighlighted: true });
    }

    async function handleEndRoom() {
        await update(ref(database, `rooms/${roomId}`), { endedAt: new Date() });

        history.push('/');  
    }

    return (
        <div id="page-room">
            <header>
                <div className="content">
                    <img src={logoImg} alt="Letmeask" />
                    <div>
                        <RoomCode code={roomId} />
                        <Button isOutlined onClick={handleEndRoom}>Encerrar sala</Button>
                    </div>
                </div>
            </header>

            <main>
                <div className="room-title">
                    <h1>Sala {title}</h1>
                    { questions.length > 0 && <span>{questions.length} pergunta(s)</span> }
                </div>

                <div className="question-list">
                    { questions.map(question => (
                        <Question
                            key={question.id}
                            content={question.content}
                            author={question.author}
                            isAnswered={question.isAnswered}
                            isHighlighted={question.isHighlighted}
                        >
                            {!question.isAnswered &&(
                                <>
                                    <button type="button" onClick={() => handleCheckQuestionAsAnswered(question.id)}>
                                        <img src={checkImg} alt="Marcar pergunta como respondida" />
                                    </button>
                                    <button type="button" onClick={() => handleHighlightQuestion(question.id)}>
                                        <img src={answerImg} alt="Dar destaque à pergunta" />
                                    </button>
                                </>
                            )}
                            <button type="button" onClick={() => handleRemoveQuestion(question.id)}>
                                <img src={deleteImg} alt="Remover pergunta" />
                            </button>
                        </Question>
                    )) }
                </div>
            </main>
        </div>
    );
}