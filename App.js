import React from 'react';
import './App.css';
import YijuPhishingSimulator from './YijuPhishingSimulator';
import YijuDataVis from './YijuDataVis'; 
import YijuStoryGame from './YijuStoryGame';
import YijuScrollRight from './YijuScrollRight'; ;


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>All files that was deployed on vercel:
  <a href="https://github.com/mrym-emm/all-features" target="_blank">
    All on GitHub
  </a></h1>
  <h1>Individual files:
  <a href="https://github.com/mrym-emm/for-yiju" target="_blank">
    All on GitHub
  </a></h1>
      </header>
      <main>
        <h2>For User Story 8? Phishing simulator </h2>
        <h3>File are YijuPhishingSimulator.js</h3>
        <YijuPhishingSimulator />

        <h2>For User Story 3.1 Ransomware live data </h2>
        <h3>File are YijuDataVis.js, css also inside at the end of code</h3>
        <h5>So before here can add wht ransomware is in a attractive way for teens and mention tht its ASEAN datsa. doesnt have to be deep. and mention its live data from ransomware.live.</h5>
        <h5>can changehowever uyou want</h5>
        <YijuDataVis />

        <h2>For User Story 3.2 Data Storytelling via side scrolling platform game, Since I use the embed code, as I update, it shuold be live here </h2>
        <h3>Files YijuStoryGame.js</h3>
        <YijuStoryGame />

        <h2>The same as above, just with the scroll right </h2>
        <h3>Files are YijuScrollRight.js, YijuScrollRight.css and same as above, YijuStoryGame.js</h3>
        <YijuScrollRight />
      </main>
    </div>
  );
}

export default App;