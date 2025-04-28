import React, { useEffect, useState } from "react";
import Web3 from "web3";
import VotingContract from "./VotingContract.json"; // ABI JSON

const CONTRACT_ADDRESS = "0x1D489a18723eC6d59a581bce9d3abC8a6D297Ec5";

function App() {
  const [account, setAccount] = useState("");
  const [voting, setVoting] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [winner, setWinner] = useState("");

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.enable();

        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);

        const contract = new web3.eth.Contract(VotingContract.abi, CONTRACT_ADDRESS);
        setVoting(contract);

        const candidateList = await contract.methods.getAllCandidates().call();
        setCandidates(candidateList);
      } else {
        alert("Please install MetaMask.");
      }
    };

    init();
  }, []);

  const vote = async () => {
    if (selectedCandidate && voting) {
      try {
        await voting.methods.vote(selectedCandidate).send({ from: account });
        alert("Vote cast successfully!");
      } catch (err) {
        alert("Voting failed or already voted.");
      }
    }
  };

  const endElection = async () => {
    if (voting) {
      try {
        await voting.methods.endElection().send({ from: account });
        alert("Election ended.");
      } catch (err) {
        alert("Only admin can end election or it has already ended.");
      }
    }
  };

  const fetchWinner = async () => {
    if (voting) {
      try {
        const result = await voting.methods.getWinner().call();
        setWinner(result);
      } catch (err) {
        alert("Election must be ended to get the winner.");
      }
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Voting DApp</h1>
      <p>Connected Account: {account}</p>

      <h2>Vote for a Candidate</h2>
      <select onChange={(e) => setSelectedCandidate(e.target.value)} value={selectedCandidate}>
        <option value="">Select a candidate</option>
        {candidates.map((name, index) => (
          <option key={index} value={name}>
            {name}
          </option>
        ))}
      </select>
      <button onClick={vote} style={{ marginLeft: "10px" }}>
        Vote
      </button>

      <h2>Admin Controls</h2>
      <button onClick={endElection}>End Election</button>

      <h2>Election Results</h2>
      <button onClick={fetchWinner}>Get Winner</button>
      {winner && <p><strong>Winner:</strong> {winner}</p>}
    </div>
  );
}

export default App;
