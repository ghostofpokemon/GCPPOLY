import './App.css';
import styled from 'styled-components';
import BgImg from './img-1.jpg';
import {useState} from 'react';
import Button from '@material-ui/core/Button';
import GCPPOLYabi from './GCPPOLYabi.json';
import Web3 from 'web3';
import API from './API';
import Countdown from 'react-countdown';
import {NumberInput} from './NumberInput';
import Input from '@material-ui/core/Input';

const GCPaddress = '0x1b9551217f85bcBFcDC94Dbc4c18052c2043Cdb2';
const Container = styled.div`
  background-image: url(${BgImg});
  min-height: 101vh;
  background-size: cover;
  width: 100vw;
`;
const Navbar = styled.div`
  background: linear-gradient(90deg, hsl(0, 80%, 70%), #55dad3);
  height: 70x;
  width: 100%;
`;

const Navwrapper = styled.div`
  display: flex;
  align-items: center;
  height: 42px;
  justify-content: space-between;
`;

const Logo = styled.div`
  color: #49b8b2;
  margin-left: 2%;
  font-size: 1.2rem;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 2px;
`;
const APIc = styled.div`
  color: #888;
`;
const Dot = styled.div`
  display: flex;
`;
const ButtonCon = styled.div`
  margin: auto 0;
  margin-right: 2%;
  color: #fff;
  align-items: center;
  justify-content: space-between;
`;

const Graph = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 2%;
  opacity: 95%;
  z-index: 0;
`;
const Mainwrapper = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  padding-bottom: 3%;
`;

const Words = styled.p`
  width: 75vw;
  padding-top: 1%;
  border-radius: 25px;
  padding: 20px;
  opacity: 90%;
`;

const Choices = styled.div`
  width: 75vw;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  margin-top: 7%;
  gap: 10px;
  margin-bottom: 4%;
  width: 30vw;
`;

const Countdownc = styled.div`
 margin: 0;
  font-size: 5.5em;
  margin-top: -0.6em;
  color: white;
  text-shadow: 0 0 0.05em #fff, 0 0 0.2em #fe05e1, 0 0 0.3em #fe05e1;
  transform: rotate(-7deg);
  opacity: 50%;
}`;

const Inputc = styled.form`
  opacity: 55%;
  display: flex;
`;

const Buttons = styled.div`
  display: flex;
  align-items: center;
  gap: 30%;
`;

function App() {
  const [web3, setWeb3] = useState('');
  const [instance, setInstance] = useState('');
  const [account, setAccount] = useState('a');
  const [netId, setNetId] = useState('');
  const [balance, setBalance] = useState('0');
  const [playerBalance, setPlayerBalance] = useState('0');
  const [countdown, setCountdown] = useState(false);
  const [betAmount, setBet] = useState('.01');
  const [isDisabled, setDisabled] = useState(true);

  const clickfirst = async () => {
    window.ethereum
      .request({
        method: 'eth_requestAccounts',
      })
      .catch((err) => {
        if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          console.log('Please connect to MetaMask.');
        } else {
          console.error(err);
        }
      });
    connect();
  };

  const connect = async () => {
    const web3 = new Web3(window.ethereum);
    let accounts;
    web3.eth.getAccounts().then(function (acc) {
      accounts = acc;
      setAccount(accounts[0]);
    });
    setWeb3(web3);
    const netId = await web3.eth.net.getId();
    setNetId(netId);
    const instance = new web3.eth.Contract(GCPPOLYabi, GCPaddress, {
      from: accounts[0],
    });
    setInstance(instance);
    instance.methods
      .getPlayerBalance()
      .call()
      .then((res) => setPlayerBalance(web3.utils.fromWei(res, 'ether')));
    instance.methods
      .getContractBalance()
      .call()
      .then((res) => {
        setBalance(web3.utils.fromWei(res, 'ether'));
      });
    setDisabled(false);
  };

  const chooseLeft = async () => {
    instance.methods.bet(1).send({
      from: account,
      gas: 3000000,
      value: betAmount * 10 ** 18,
    });
    setCountdown(true);
  };

  const chooseRight = async () => {
    instance.methods.bet(0).send({
      from: account,
      gas: 3000000,
      value: betAmount * 10 ** 18,
    });
    setCountdown(true);
  };

  function handleChainChanged(_chainId) {
    window.location.reload();
  }

  const withdrawPlayerBalance = async () => {
    instance.methods.withdrawPlayerBalance().send({
      from: account,
      gas: 3000000,
      value: 0,
    });
  };

  const getPlayerBalance = async () => {
    instance.methods
      .getPlayerBalance()
      .call()
      .then((res) => setPlayerBalance(res));
  };

  window.ethereum.on('chainChanged', handleChainChanged);

  return (
    <Container>
      <Navbar>
        <Navwrapper>
          <Logo>
            GCP
            <Dot>
              <iframe
                title="dot"
                className="dot"
                src="https://global-mind.org/gcpdot/gcp.html"
                height="18"
                width="18"
                scrolling="no"
                marginWidth="0"
                marginHeight="0"
                frameBorder="0"
              />
            </Dot>
            POLY
          </Logo>
          <APIc>
            <API />
          </APIc>
          <ButtonCon>
            {netId === '' ? (
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                onClick={clickfirst}
              >
                CONNECT
              </Button>
            ) : (
              <Button
                variant="outlined"
                color="default"
                size="small"
                onPerss={getPlayerBalance}
              >
                Ξ {playerBalance.substring(0, 5)}
              </Button>
            )}
          </ButtonCon>
        </Navwrapper>
      </Navbar>

      <Graph>
        <iframe
          className="graph"
          title="chart"
          src="https://global-mind.org/gcpdot/gcpchart.php"
          height="300"
          width="80%"
          marginWidth="0"
          marginHeight="0"
          scrolling="no"
          frameBorder="0"
        ></iframe>
      </Graph>

      <Mainwrapper>
        <Words>
          Baby skateboard hashtag letterpress, selfies portland microdosing roof
          party biodiesel cliche small batch poutine ramps mustache. Church-key
          palo santo lumbersexual cred small batch hella hell of paleo readymade
          intelligentsia street art bushwick meh.
        </Words>
        <Countdownc>
          {countdown == true ? (
            <Countdown date={Date.now() + 10000000} />
          ) : null}
        </Countdownc>
        <Buttons>
          <Inputc>
            <Input
              onChange={(e) => setBet(e.target.value)}
              placeholder="Double it 🚀"
              color="primary"
              type="number"
              disabled={isDisabled}
              inputProps={{
                style: {
                  fontWeight: 900,
                  fontFamily: 'Zen Dots',
                  justifyContent: 'center',
                  display: 'flex',
                },
              }}
            />
          </Inputc>
          <Choices>
            {window.ethereum.networkVersion === '80001' && account !== 'a' ? (
              <Button variant="outlined" onClick={chooseLeft} color="secondary">
                0 - 49%
              </Button>
            ) : (
              <Button variant="outlined" color="primary" disabled>
                Connect to Mumbai
              </Button>
            )}
            {window.ethereum.networkVersion === '80001' && account !== 'a' ? (
              <Button
                variant="outlined"
                margin="auto"
                onClick={chooseRight}
                color="primary"
              >
                100 - 51%
              </Button>
            ) : (
              <Button variant="outlined" margin="auto" color="primary" disabled>
                chainId 80001
              </Button>
            )}
          </Choices>
        </Buttons>
      </Mainwrapper>
    </Container>
  );
}
export default App;
