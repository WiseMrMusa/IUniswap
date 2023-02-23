import { ethers } from "hardhat";
import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers"
import { Signer, BigNumber } from 'ethers';

const TokenAddress = {
  USDT : "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  BNB : "0xB8c77482e45F1F44dE1745F52C74426C631bDD52",
  DAI : "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  UNI : "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
}



async function GetTokenBalance(tokenAddress : string, holderAddress : string) {
  const Token = await ethers.getContractAt("IERC20",tokenAddress);
  return await Token.balanceOf(holderAddress);
}

async function ApproveToken(
  tokenAddress : string, 
  spenderAddress : string, 
  allowance : BigNumber, 
  Signer : Signer
  ) {
  let Token = await ethers.getContractAt("IERC20",tokenAddress);
  await Token.connect(Signer).approve(spenderAddress,allowance);
}

async function main() {
  const UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  const UniswapContract = await ethers.getContractAt("IUniswapV2Router01",UNISWAP_ROUTER_ADDRESS);

  const DAI_Holder = "0x748dE14197922c4Ae258c7939C7739f3ff1db573";
  await impersonateAccount(DAI_Holder);
  await setBalance(DAI_Holder,10000000000000000000000);
  const DAI_Signer = await ethers.getSigner(DAI_Holder);


  console.log(await GetTokenBalance(TokenAddress.DAI,DAI_Holder));
  console.log(await GetTokenBalance(TokenAddress.UNI,DAI_Holder));

  await ApproveToken(TokenAddress.DAI, UNISWAP_ROUTER_ADDRESS,await ethers.utils.parseEther("100"),DAI_Signer);

  await UniswapContract.connect(DAI_Signer).swapExactTokensForTokens(
    await ethers.utils.parseEther("100"),
    100,
    [TokenAddress.DAI, TokenAddress.UNI],
    DAI_Holder,
    1709251199
    )

  console.log(await GetTokenBalance(TokenAddress.DAI,DAI_Holder));
  console.log(await GetTokenBalance(TokenAddress.UNI,DAI_Holder));

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
