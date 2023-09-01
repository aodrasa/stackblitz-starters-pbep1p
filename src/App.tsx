import * as React from 'react';
import AirOps from '@airops/airops-js';
import './style.css';
import cn from 'classnames';
import useMessageManager, { MessageType } from './useMessageManager';
import { MessageList, MessageBox } from 'react-chat-elements';

export default function App() {
  const { messages, addMessage } = useMessageManager();
  const [stream, setStream] = React.useState('');
  const [error, setError] = React.useState(null);
  const [userId, setUserId] = React.useState(null);
  const [workspaceId, setWorkspaceId] = React.useState(null);
  const [hashedUserId, setHashedUserId] = React.useState(null);
  const [airopsInstance, setAiropsInstance] = React.useState(null);

  const [appId, setAppId] = React.useState(null);

  const [message, setMessage] = React.useState('');
  const [sessionId, setSessionId] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [initChat, setInitChat] = React.useState(false);

  const handleSubmit = (event) => {
    console.log('event: ', event);
    event.preventDefault();
    setError(null);
    try {
      const airopsInstance = AirOps.identify({
        userId,
        workspaceId,
        hashedUserId,
      });
      setAiropsInstance(airopsInstance);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    setLoading(true);

    addMessage(MessageType.User, message);

    try {
      const response = await airopsInstance.apps.chatStream({
        appId,
        message,
        streamCallback: (data: { token: string }) => {
          console.log(data.token);
          setStream((stream) => stream + data?.token);
        },
        streamCompletedCallback: (data: { result: string }) => {
          console.log('stream completed callback result: ', data.result);
        },
        ...(sessionId && { sessionId }),
      });
      console.log('response: ', response);
      setSessionId(response.sessionId);
      const result = await response.result;
      console.log('result: ', result);
      addMessage(MessageType.Assistant, result.result);
      setStream('');
      setMessage('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 flex flex-col h-screen w-screen overflow-x-hidden">
      <h1 className="text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
        AirOps SDK playground
      </h1>

      {!airopsInstance && (
        <form className="mt-4 flex flex-col" onSubmit={handleSubmit}>
          <label className="text-gray-700 text-sm font-bold mb-2">
            User Id:
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
            />
          </label>

          <label className="text-gray-700 text-sm font-bold mb-2">
            Workspace Id:
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              value={workspaceId}
              onChange={(event) => setWorkspaceId(event.target.value)}
            />
          </label>

          <label className="text-gray-700 text-sm font-bold mb-2">
            Hashed User Id:
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              value={hashedUserId}
              onChange={(event) => setHashedUserId(event.target.value)}
            />
          </label>

          <button
            className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Identify
          </button>
          {error && <p>Error: {error}</p>}
        </form>
      )}

      {airopsInstance && !initChat && (
        <div className="mt-4 w-full">
          <form className="flex flex-col">
            <label className="mb-4 block text-gray-700 text-sm font-bold mb-2">
              App Id:
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                value={appId}
                onChange={(event) => setAppId(event.target.value)}
              />
            </label>
            <button
              className={cn(
                'mr-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline',
                {
                  'text-white bg-blue-300 rounded focus:outline-none cursor-not-allowed':
                    loading,
                }
              )}
              type="button"
              onClick={(event) => {
                event.preventDefault();
                setInitChat(true);
              }}
            >
              Chat
            </button>
          </form>

          {error && <p className="mt-4">Error running the app: {error}</p>}
        </div>
      )}

      {airopsInstance && initChat && (
        <div className="h-full w-full flex flex-col aling-items-center">
          <div className="py-4 mb-auto h-auto overflow-y-scroll">
            <MessageList
              lockable={true}
              dataSource={messages.map((message) => ({
                position: message.type === 'User' ? 'left' : 'right',
                type: 'text',
                title: message.type,
                text: message.message,
              }))}
            />
            {stream && (
              <MessageBox
                position={'right'}
                type={'text'}
                title={'Assistant'}
                text={stream}
              />
            )}
          </div>

          <form className="w-full">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                placeholder="Say something..."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </label>
            <button
              className={cn(
                'w-full bg-blue-500 shover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline',
                {
                  'text-white bg-blue-300 rounded focus:outline-none cursor-not-allowed':
                    loading,
                }
              )}
              type="button"
              onClick={handleSendMessage}
            >
              Send
            </button>
          </form>

          {error && <p className="mt-4">Error running the app: {error}</p>}
        </div>
      )}
    </div>
  );
}
