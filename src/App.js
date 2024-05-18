import './App.css';
import { Client, xrpToDrops, dropsToXrp } from "xrpl";
import React, { useEffect, useState } from "react";


function App() {

  const [balance, setBalance] = useState(0)
  const [wallet, setWallet] = useState("")
  const [client] = useState(new Client("wss://s.altnet.rippletest.net:51233"))
  const [paymentButtonText, setPaymentButtonText] = useState("Wait for the wallet to be funded")
  const [statusText, setStatusText] = useState("")

  useEffect(() => {
    console.log("start connection")

    client.connect().then(() => {
      console.log("connected")
      console.log("funding wallet")

      client.fundWallet().then((fund_result) => {
        console.log(fund_result.wallet)
        setBalance(fund_result.balance)
        setWallet(fund_result.wallet)
        setPaymentButtonText("Send a 22 XRP Payment!");
      });
    });
  }, []);

  async function sendPayment() {
    console.log("Creating a payment transaction")
    setStatusText("Sending a payment for 22XRP...")
    const tx = {
      TransactionType: "Payment",
      Account: wallet.address,
      Amount: xrpToDrops("22"),
      Destination: "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe"
    }

    console.log("Submitting the transaction(Takes 3-5 seconds)")
    const submitted_tx = await client.submitAndWait(tx, {
      autofill: true,
      wallet: wallet
    })

    console.log(
      "Transaction Result:",
      submitted_tx.result.meta.TransactionResult
    )
    setStatusText("Sent!(See logs for full details)")

    const account_info = await client.request({
      command: "account_info",
      account: wallet.address
    })

    const balance = account_info.result.account_data.Balance
    console.log(`Account ${wallet.address} has a balance of ${balance} drops`)

    setBalance(dropsToXrp(balance))

  }

  return (
    <div className="App">
      <header className="App-header">
        The new wallet currently has {balance} XRP <br />
        <br />

        <button onClick={sendPayment}>{paymentButtonText}</button>
        <p>Watch the console to see the payment flow in action!</p>
        <p>
          <i>{statusText}</i>
        </p>

      </header>
    </div>
  );
}

export default App;
