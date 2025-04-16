import React, { useState, useEffect } from 'react';
// store chat messages, user input, loading state, and conversation tracking
const YijuPhishingSimulator = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [apiMessages, setApiMessages] = useState([]);

  // helper function to call the llm api and extract the response text
  const simulateScam = async (messagesArray) => {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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'
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: messagesArray
        })
      });

      const data = await response.json();
      if (data.error) {
        console.error("API Error:", data.error);
        return "Sorry, there was an error with the simulation.";
      }

      return data.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("Error:", error);
      return "Sorry, there was an error with the simulation.";
    }
  };

  // intialize the simulation when component loads
  useEffect(() => {
    startSimulation();
    // disable-next-line toa ovoid duplication showing
  }, []);

  const startSimulation = async () => {
    setIsLoading(true);
    setMessages([]);
    setExchangeCount(0);

    // setting up initial prompts, system instructions and user setup. had to be specific as possible to achieve what we want
    const initialApiMessages = [
        {
          role: "system",
          content: `
      You are roleplaying as a staff member from a Malaysian educational grant or sponsorship organization offering a fake grant in a phishing scenario. You can use any basic Malaysian name.
      
      Keep each response short and casual — as if texting someone on a phone (e.g., WhatsApp). 
      - Avoid large paragraphs. 
      - No formal sign-offs like "Kind regards" or "Sincerely." 
      - Keep it friendly but professional enough for a quick text conversation.
      - Make them feel speacial and the 'chosen' one
      
      Chat outline:
      1) For the user's first 3 replies, respond with your short scam pitch, offering the fake grant and politely asking for details. 
      2) When the user replies for the 4th time, do NOT answer with more scam text. Instead, produce a single final message that starts with "REALITY CHECK," evaluating how the user responded (e.g., cautious, shared info, etc.). 
         - If they shared personal details, remind them to be careful. 
         - Include a quick statement like: "In real life, no one just offers you money or grants out of the blue. Always double-check before sharing info"
         -Use your own words to evaluate how well the teen repsonded overall
         - Stay short, teen-friendly but professional, and end after that. 
         - No extra disclaimers or scam content.
      
      No bold, italics, or extra formatting. Just plain text messages.
      `
        },
        {
          role: "user",
          content: `
      Start the conversation pretending you’re from a Malaysian grant body (JPA, Yayasan Peneraju etc). Make it text-message style (short lines, quick chat but try to avoid one wordedness). Make them sound special and always speak in English
      After I've replied 4 times, end with one final "REALITY CHECK" message and stop.
      No long paragraphs, no "Kind regards."
      `
        }
      ];
      
      

    setApiMessages(initialApiMessages);

    try {
        // making the first api call to get the initial message from the scammer
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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'
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: initialApiMessages
        })
      });

      const data = await response.json();
      if (data.error) {
        console.error("API Error:", data.error);
        setMessages([
          {
            sender: 'System',
            text: "Error starting simulation: " + data.error.message
          }
        ]);
        setIsLoading(false);
        return;
      }

      const initialResponse = data.choices[0]?.message?.content || "";
      // storing the first message from the ai in our conversation history
      setApiMessages(prev => [...prev, { role: "assistant", content: initialResponse }]);

      if (initialResponse.trim()) {
        setMessages([
          { sender: '', text: initialResponse }
        ]);
      }
    } catch (error) {
      console.error("Error starting simulation:", error);
      setMessages([
        {
          sender: 'System',
          text: "Error starting simulation: " + (error.message || "Unknown error")
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // function to handle when user sends a message
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    // add user message to chat display
    setMessages(prev => [...prev, { sender: 'You', text: userInput }]);

    // update the full conversation history
    const newApiMessages = [...apiMessages, { role: 'user', content: userInput }];
    setApiMessages(newApiMessages);

    setIsLoading(true);
    setUserInput('');

    const newExchangeCount = exchangeCount + 1;
    setExchangeCount(newExchangeCount);

    try {
      // get ai response to user message
      const response = await simulateScam(newApiMessages);

      // handle errors or blank responses
      if (response.startsWith("Sorry, there was an error") || !response.trim()) {
        setMessages(prev => [...prev, { sender: 'System', text: response }]);
        setIsLoading(false);
        return;
      }

      // add ai response to conversation history to ensure consistency
      setApiMessages(prev => [...prev, { role: "assistant", content: response }]);

      // check if this is the final exchange that triggers the reality check
      if (newExchangeCount >= 3) {
        // showing the final reality check message
        setMessages(prev => [...prev, { sender: '', text: response }]);

        // could disable input here if wanted
        return;
      }

      // regular scam message display
      setMessages(prev => [...prev, { sender: '', text: response }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [
        {
          sender: 'System',
          text: "Error sending message: " + (error.message || "Unknown error")
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

    // building the chat ui with bubbles and input field
    return (
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
          <h2>Phishing Scam</h2>
    
          {/* chat area */}
          <div
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              height: '400px',
              padding: '15px',
              overflowY: 'auto',
              backgroundColor: '#f5f5f5',
              marginBottom: '15px',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {messages.filter(msg => msg.text?.trim()).map((msg, index) => (
              <div
                key={index}
                style={{
                  maxWidth: '80%',
                  padding: '10px 15px',
                  borderRadius: '18px',
                  marginBottom: '10px',
                  backgroundColor:
                    msg.sender === 'You'
                      ? '#dcf8c6'
                      : msg.sender === 'System'
                      ? '#ffcccb'
                      : 'white',
                  alignSelf: msg.sender === 'You' ? 'flex-end' : 'flex-start',
                  marginLeft: msg.sender === 'You' ? 'auto' : '0',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                {msg.sender === 'System' && (
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                    {msg.sender}
                  </div>
                )}
                <div>{msg.text}</div>
              </div>
            ))}
    
            {isLoading && (
              <div style={{ textAlign: 'center', margin: '15px 0', alignSelf: 'flex-start' }}>
                <div
                  style={{
                    padding: '10px 15px',
                    borderRadius: '18px',
                    backgroundColor: 'white',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                >
                  Typing...
                </div>
              </div>
            )}
          </div>
    
          {/* user input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your response..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              style={{
                flex: 1,
                padding: '10px 15px',
                border: '1px solid #ccc',
                borderRadius: '25px',
                fontSize: '16px',
                outline: 'none',
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !userInput.trim()}
              style={{
                padding: '10px 18px',
                backgroundColor: '#4CAF50',
                color: '#fff',
                border: 'none',
                borderRadius: '25px',
                fontSize: '16px',
                cursor: isLoading || !userInput.trim() ? 'not-allowed' : 'pointer',
                opacity: isLoading || !userInput.trim() ? '0.7' : '1'
              }}
            >
              Send
            </button>
          </div>
    
          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <button onClick={startSimulation}>
              Restart Simulation
            </button>
          </div>
        </div>
      );
    };
    
    export default YijuPhishingSimulator;