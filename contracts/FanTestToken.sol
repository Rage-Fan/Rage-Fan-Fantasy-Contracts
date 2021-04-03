pragma solidity 0.5.16;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "./EIP712MetaTransaction.sol";

contract FanTestToken is ERC20, ERC20Detailed, EIP712MetaTransaction, Ownable  {
    uint256 public initialSupply = 1000000000000000000000;

    constructor()
        public
        ERC20Detailed("RAGE Token", "TRAGE", 18) 
        EIP712MetaTransaction("FanTestToken", "1", 80001)
    {           
        _mint(msgSender(), initialSupply);
    }

    function approve(address spender, uint256 amount) public returns (bool) {
        super._approve(msgSender(), spender, amount);
        return true;
    }

	// helper function
    function mint(uint256 supply) external {
        _mint(msgSender(), supply);
    }

    function transfer (address to, uint256 value)
    public
    returns (bool success)
    {
        super._transfer(msgSender(), to, value);       
         return true;                 
    }

    function transferFrom (address from, address to, uint256 value)
    public        
    returns (bool success)
    {       
        super.transferFrom(from, to, value);
        return true;       
    }

    function increaseAllowance(address spender, uint256 addedValue) public returns (bool) {
        super.increaseAllowance(spender, addedValue);
        return true;
    }

    function burnToken(address to, uint256 value)
     public  
     onlyOwner  
     returns (bool success)
    {   
       super._burn(to, value);   
        success = true;
    }

}