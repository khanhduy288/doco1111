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

// Địa chỉ token USDT trên BSC
const usdtAddress = "0x55d398326f99059fF775485246999027B3197955";
// Địa chỉ contract của bạn
const contractAddress = "0xe36b97A6D63E903dB7859CCD478c8b032558a295";

const contractABI = [
  // ... giữ nguyên ABI như bạn đã cung cấp
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
    chainId: "0x38", // 56 in hex
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
    message.success("Đã chuyển sang mạng Binance Smart Chain (BSC).");
  } catch (switchError) {
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [bscParams],
        });
        message.success("Đã thêm và chuyển sang mạng BSC.");
      } catch (addError) {
        message.error("Không thể thêm mạng BSC vào MetaMask.");
      }
    } else {
      message.error("Người dùng đã huỷ chuyển sang mạng BSC.");
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
      message.warning("Không tìm thấy MetaMask.");
    }
  }, []);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        message.error("Vui lòng cài đặt MetaMask!");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setWalletAddress(accounts[0]);
      message.success("Kết nối ví thành công!");
    } catch (error) {
      console.error("Lỗi khi kết nối ví:", error);
      message.error("Kết nối ví thất bại!");
    }
  };
const handleWithdraw = async () => {
  if (!walletAddress) {
    message.warning("Vui lòng kết nối ví trước khi rút tiền!");
    return;
  }

  try {
    setLoading(true);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    const tokenContract = new ethers.Contract(
      usdtAddress,
      [
        "function balanceOf(address) view returns (uint256)",
        "function decimals() view returns (uint8)",
      ],
      provider
    );

    const balance = await tokenContract.balanceOf(contractAddress);
    console.log("Balance contract USDT:", balance.toString());

    // ethers v6 trả về bigint, so sánh kiểu này
    if (balance === 0n) {
      message.warning("Ví smart không còn USDT để rút.");
      setLoading(false);
      return;
    }

    const tx = await contract.withdrawUSDT(balance);
    message.info("Đang gửi giao dịch...");
    await tx.wait();
    message.success("Rút hết USDT thành công!");
  } catch (error) {
    console.error("Lỗi khi rút tiền:", error);
    message.error("Lỗi khi rút tiền: " + (error.message || error));
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
            Doanh Thu & Lợi Nhuận
          </Title>

          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <Space>
              <Button type="default" onClick={connectWallet}>
                {walletAddress ? "Ví đã kết nối" : "Kết nối ví MetaMask"}
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
                  Tổng Doanh Thu
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
                  Tổng Lợi Nhuận
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
              Rút tiền từ ví Smart Contract
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
                  name="Doanh Thu"
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#52c41a"
                  name="Lợi Nhuận"
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
