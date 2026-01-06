const host = window.location.hostname;

chrome.storage.local.get(["blocked"], (data) => {
  const blocked = data.blocked || []; // Load blocked sites from storage or return an empty array

  if (blocked.includes(host)) {
    // Check if this tab is allowed
    chrome.runtime.sendMessage(
      { type: "isAllowed", host: host },
      (response) => {
        if (response.allowed) {
          // Allow the page to load normally
          return;
        }

        // Show block page immediately (page won't load due to webRequest blocking)
        renderBlockedPage();

        // Add event listener for password submission
        document.getElementById("submitPass").addEventListener("click", () => {
          submitPassword();
        });

        // Also handle Enter key in password input
        document
          .getElementById("passInput")
          .addEventListener("keypress", (e) => {
            if (e.key !== "Enter") {
              return;
            }
            document.getElementById("submitPass").click();
          });
      },
    );
  }
});

const renderBlockedPage = () => {
  return (document.documentElement.innerHTML = `
  <head>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M18.364 5.63604C19.9926 7.26472 21 9.51472 21 12C21 16.9706 16.9706 21 12 21C9.51472 21 7.26472 19.9926 5.63604 18.364M18.364 5.63604C16.7353 4.00736 14.4853 3 12 3C7.02944 3 3 7.02944 3 12C3 14.4853 4.00736 16.7353 5.63604 18.364M18.364 5.63604L5.63604 18.364' stroke='red' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>" type="image/svg+xml">
    <meta charset="UTF-8">
    <title>Site Blocked</title>
    <style>
      body {
        align-items: center;
        justify-content: center;
        display: flex;
        min-height: 100vh;
        margin: 0; /* Changed from 0 auto */
        font-family: Arial, sans-serif;
        text-align: center;
        background: #090909;
        color: #ffffff;
      }
      .blocked-container {
        background-color: #1a1a1a; /* A very dark gray, almost black */
        border: 1px solid #666666; /* Gray border */
        padding: 30px; /* Padding inside the block */
        border-radius: 8px; /* Slightly rounded corners */
        max-width: 500px; /* Limit the width */
        margin: 20px; /* Margin for responsiveness on smaller screens */
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Subtle shadow */
      }
      h1 { color: #f44336; margin-bottom: 20px; } /* Added margin */
      p { margin-top: 20px; margin-bottom: 20px;} /* Added for paragraphs */
      input {
        padding: 10px; /* Increased padding */
        margin: 10px 0; /* Adjusted margin */
        width: 250px; /* Increased width */
        border: 1px solid #555555; /* Grayish border */
        border-radius: 4px;
        background-color: #333333; /* Darker background for input */
        color: #ffffff; /* White text */
        font-size: 16px; /* Larger font */
      }
      input::placeholder {
        color: #aaaaaa; /* Placeholder color */
      }
      button {
        padding: 10px 20px; /* Increased padding */
        background: #1565C0;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px; /* Larger font */
        font-weight: bold;
        transition: background 0.2s;
        margin-top: 10px; /* Added margin */
      }
      button:hover {
        background: #0d47a1;
      }
      .block-container {
        background-color: #1a1a1a; /* A very dark gray, almost black */
        border: 1px solid #666666; /* Gray border */
        padding: 30px; /* Padding inside the block */
        border-radius: 8px; /* Slightly rounded corners */
        max-width: 500px; /* Limit the width */
        margin: 20px; /* Margin for responsiveness on smaller screens */
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Subtle shadow */
      }
    </style>
  </head>
  <body>
    <div class="blocked-container">
      <h1>Site Blocked</h1>
      <svg width="200px" height="200px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.364 5.63604C19.9926 7.26472 21 9.51472 21 12C21 16.9706 16.9706 21 12 21C9.51472 21 7.26472 19.9926 5.63604 18.364M18.364 5.63604C16.7353 4.00736 14.4853 3 12 3C7.02944 3 3 7.02944 3 12C3 14.4853 4.00736 16.7353 5.63604 18.364M18.364 5.63604L5.63604 18.364" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <p>Enter the password to access this site:</p>
      <input type="password" id="passInput" placeholder="Enter password" autocomplete="off">
      <button id="submitPass">Submit</button>
    </div>
  </body>
  `);
};

const submitPassword = () => {
  const password = document.getElementById("passInput").value;
  chrome.runtime.sendMessage(
    { type: "checkAndUnblock", pass: password, host: host },
    (response) => {
      response.success ? location.reload() : alert("Incorrect password");
    },
  );
};
