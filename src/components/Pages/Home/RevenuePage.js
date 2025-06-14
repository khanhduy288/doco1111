import React, { useState, useEffect } from "react";
import {
  Layout,
  Typography,
  Card,
  Button,
  message,
  Row,
  Col,
  Space,
} from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ethers } from "ethers";

const { Content } = Layout;
const { Title, Text } = Typography;

const usdtAddress = "0x55d398326f99059fF775485246999027B3197955";
const contractAddress = "0xe36b97A6D63E903dB7859CCD478c8b032558a295";

const contractABI = [
  {
    inputs: [
      { internalType: "address", name: "_usdt", type: "address" }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: true, internalType: "uint256", name: "betId", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "Claimed",
    type: "event"
  },
  {
    inputs: [
      { internalType: "uint256", name: "betId", type: "uint256" },
      { internalType: "uint256", name: "betTime", type: "uint256" },
      { internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    name: "claimed",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "usdt",
    outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "withdrawUSDT",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];

const data = [
  { month: "Jan", revenue: 4000, profit: 2400 },
  { month: "Feb", revenue: 3000, profit: 1398 },
  { month: "Mar", revenue: 2000, profit: 9800 },
  { month: "Apr", revenue: 2780, profit: 3908 },
  { month: "May", revenue: 1890, profit: 4800 },
  { month: "Jun", revenue: 2390, profit: 3800 },
  { month: "Jul", revenue: 3490, profit: 4300 },
];

function truncateAddress(address) {
  return address
    ? address.slice(0, 6) + "..." + address.slice(address.length - 4)
    : "";
}

const switchToBSC = async () => {
  const bscParams = {
    chainId: "0x38",
    chainName: "Binance Smart Chain",
    nativeCurrency: {
      name: "Binance Coin",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: ["https://bsc-dataseed.binance.org/"],
    blockExplorerUrls: ["https://bscscan.com/"],
  };

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: bscParams.chainId }],
    });
    message.success("Switched to Binance Smart Chain (BSC).");
  } catch (switchError) {
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [bscParams],
        });
        message.success("BSC network added and switched successfully.");
      } catch (addError) {
        message.error("Failed to add BSC network to MetaMask.");
      }
    } else {
      message.error("User canceled the network switch.");
    }
  }
};

const RevenuePage = () => {
  const [loading, setLoading] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    const revenueSum = data.reduce((acc, cur) => acc + cur.revenue, 0);
    const profitSum = data.reduce((acc, cur) => acc + cur.profit, 0);
    setTotalRevenue(revenueSum);
    setTotalProfit(profitSum);

    if (window.ethereum) {
      switchToBSC();
    } else {
      message.warning("MetaMask not found.");
    }
  }, []);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        message.error("Please install MetaMask!");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setWalletAddress(accounts[0]);
      message.success("Wallet connected successfully!");
    } catch (error) {
      console.error("Wallet connection error:", error);
      message.error("Failed to connect wallet!");
    }
  };

  const handleWithdraw = async () => {
    if (!walletAddress) {
      message.warning("Please connect your wallet before withdrawing!");
      return;
    }

    try {
      setLoading(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const contractOwner = await contract.owner();

      if (contractOwner.toLowerCase() !== walletAddress.toLowerCase()) {
        message.error("Error: Not the contract owner.");
        setLoading(false);
        return;
      }

      const tokenContract = new ethers.Contract(
        usdtAddress,
        [
          "function balanceOf(address) view returns (uint256)",
          "function decimals() view returns (uint8)",
        ],
        provider
      );

      const balance = await tokenContract.balanceOf(contractAddress);
      console.log("Contract USDT Balance:", balance.toString());

      if (balance === 0n) {
        message.warning("Smart contract wallet has no USDT to withdraw.");
        setLoading(false);
        return;
      }

      const tx = await contract.withdrawUSDT(balance);
      message.info("Sending transaction...");
      await tx.wait();
      message.success("Successfully withdrew all USDT!");
    } catch (error) {
      console.error("Withdrawal error:", error);
      message.error("Withdrawal error: " + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ background: "#f0f2f5", minHeight: "100vh" }}>
      <Content style={{ maxWidth: 900, margin: "40px auto", padding: "20px" }}>
        <Card
          bordered={false}
          style={{
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            backgroundColor: "#fff",
          }}
        >
          <Title level={2} style={{ textAlign: "center", marginBottom: 30 }}>
            Revenue & Profit
          </Title>

          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <Space>
              <Button type="default" onClick={connectWallet}>
                {walletAddress ? "Wallet Connected" : "Connect MetaMask Wallet"}
              </Button>
              {walletAddress && <Text code>{truncateAddress(walletAddress)}</Text>}
            </Space>
          </div>

          <Row gutter={24} justify="center" style={{ marginBottom: 40 }}>
            <Col xs={24} sm={10}>
              <Card
                style={{
                  textAlign: "center",
                  backgroundColor: "#e6f7ff",
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <Text strong style={{ fontSize: 18, color: "#1890ff" }}>
                  Total Revenue
                </Text>
                <br />
                <Text style={{ fontSize: 28, fontWeight: "bold", color: "#0a3d62" }}>
                  {totalRevenue.toLocaleString()} đ
                </Text>
              </Card>
            </Col>
            <Col xs={24} sm={10}>
              <Card
                style={{
                  textAlign: "center",
                  backgroundColor: "#f6ffed",
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <Text strong style={{ fontSize: 18, color: "#52c41a" }}>
                  Total Profit
                </Text>
                <br />
                <Text style={{ fontSize: 28, fontWeight: "bold", color: "#145214" }}>
                  {totalProfit.toLocaleString()} đ
                </Text>
              </Card>
            </Col>
          </Row>

          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <Button
              type="primary"
              size="large"
              loading={loading}
              onClick={handleWithdraw}
              style={{ minWidth: 200, fontWeight: "600" }}
            >
              Withdraw from Smart Contract Wallet
            </Button>
          </div>

          <div style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1890ff"
                  name="Revenue"
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#52c41a"
                  name="Profit"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Content>
    </Layout>
  );
};

export default RevenuePage;