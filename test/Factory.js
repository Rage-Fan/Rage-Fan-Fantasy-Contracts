const FACTORY = artifacts.require("./RageFactory.sol");
const CONTEST = artifacts.require("./RageContest.sol");
const TOKEN = artifacts.require("./RageToken.sol");
var Web3 = require('web3');

contract("Factory", async accounts => {
  let Factory;
  let Token;
  let Contest;
  const ownerAddress = accounts[0];
  const player = accounts[1];

  let newgameContest;
  let newleycreatedGame;
  let amount =  "15000000000000000000";
  before(async () => {
    Token = await TOKEN.new();
    Contest = await CONTEST.new(ownerAddress);
    Factory = await FACTORY.new(ownerAddress, Contest.address);

    newgameContest = await Factory.createNewContest("1022", "INDVSENG1022", 1617268195, 1618045795, "WinnersTakeAll", 35, 7000, true, Token.address )
    //console.log(newgameContest);  
    const children = await Factory.getContests(); 
    newleycreatedGame = await CONTEST.at(children[0]);

    //console.log(newgameContest)
  })

  
  // it("Should use factory to deploy new game Contest", async () => {
  //   assert(newgameContest = Factory.contests[0]);
  // });

  it("Should show the new game Contest Name", async () => {

    assert(newleycreatedGame.name = "INDVSENG1022");
   // newgameContest = Factory.contests[0] ; 
  
  });

  it('should transfer new Token to palyer direct', async () => {
    const  previousBalance = await Token.balanceOf(player)
    let tokenmint = Token.transfer(player, Web3.utils.toWei('15','ether'));

    const  recipientBalance = await Token.balanceOf(player)
   // console.log("Player Balance: ", Token.balanceOf(player));
    assert(recipientBalance > previousBalance ); 
  });

  it("Should approve the player fund now", async () => {
    //let appr =  await newleycreatedGame.playApprove(player, Web3.utils.toWei('10','ether'), {from: player});
    let appr =  await Token.approve(newleycreatedGame.address, Web3.utils.toWei('10','ether') , {from: player});
     assert(appr);
  });

  it("Should start the game now", async () => {
    let playnow =  await newleycreatedGame.playNow(Web3.utils.toWei('10','ether'), {from: player});
   // let playnow =  await Token.transferFrom(player, newleycreatedGame.address, Web3.utils.toWei('9','ether'), {from: player});
    assert(playnow);
  });

  it("Should cancel the game now", async () => {
    let playnow =  await newleycreatedGame.cancelContest({from: ownerAddress});
    assert(playnow);
  });

  it("Should withdraw the fund after cancelled now", async () => {
    let playnow =  await newleycreatedGame.withdraw( Web3.utils.toWei('10','ether'),  {from: player});
    assert(playnow);
  });

  // it("Should use factory to deploy new token", async () => {
  //   Token = await Factory.deployNewToken(
  //     "Demo Token",
  //     "DEMO",
  //     1000000,
  //     accounts[0]
  //   );
  //   let TokenInstance = await TOKEN.at(Token.logs[0].args.tokenAddress);
  //   let balance = await TokenInstance.balanceOf.call(accounts[0]);
  //   assert.equal(balance.valueOf(), 1000000);
  // });
});
