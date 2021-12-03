var display = document.getElementById('display');
var click = document.getElementById('click');
var multiply = document.getElementById('multiply');
var autoclick = document.getElementById('autoclick');
var bonus = document.getElementById('bonus');

var multiplierCost = 20;
var autoclickCost = 5;
var bonusCost = 500;

var autoclickOn = false;
var bonusOn = false;

var score = 0;
var clickValue = 100;
var multiplier = 1;
var bonusTime = 5;

function displayScore() {
  display.innerHTML = score;
}

function displayMultiplier() {
  multiply.value = 'Multiplier x' + multiplier + ' (next: cost ' + multiplierCost + ')';
}

function displayAutoclick() {
  autoclick.value = 'Autoclick (cost ' + autoclickCost + ')';
}

function displayBonus() {
  bonus.value = 'Bonus (cost ' + bonusCost + ')';
}

function displayBonusTime() {
  bonus.value = 'Bonus (time: ' + bonusTime + ' sec)';
}

function multiplyEnabler() {
  if (score >= multiplierCost) {
    multiply.disabled = false;
  } else {
    multiply.disabled = true;
  }
}

function autoclickEnabler() {
  if (!autoclickOn && score >= autoclickCost) {
    autoclick.disabled = false;
  } else {
    autoclick.disabled = true;
  }
}

function bonusEnabler() {
  if (!bonusOn && score >= bonusCost) {
    bonus.disabled = false;
  } else {
    bonus.disabled = true;
  }
}

function buttonsEnabler() {
  multiplyEnabler();
  autoclickEnabler();
  bonusEnabler();
}

function increaseScore() {
  score += clickValue;
  buttonsEnabler();
  displayScore();
}


function increaseMultiplier() {
  score -= multiplierCost;
  multiplier += 1;
  clickValue = multiplier;
  if (bonusOn) {
    clickValue *= 2;
  }
  multiplierCost *= multiplier;
  buttonsEnabler();
  displayScore();
  displayMultiplier();
}

function enableAutoclick() {
  score -= autoclickCost;
  autoclickOn = true;
  autoclick.disabled = true;
  displayScore();
}

function autoclickF() {
  if (autoclickOn) {
    increaseScore();
  }
}

function enableBonus() {
  score -= bonusCost;
  bonusOn = true;
  clickValue *= 2;
  bonus.disabled = true;
  displayScore();
  displayBonusTime();
}

function disableBonus() {
  bonusOn = false;
  bonusTime = 30;
  clickValue = multiplier;
  displayBonus();
  buttonsEnabler();
}

function bonusF() {
  if (bonusOn) {
    --bonusTime;
    displayBonusTime();
    if (bonusTime === 0) {
      disableBonus();
    }
  }
}

displayScore();
displayMultiplier();
displayAutoclick();
displayBonus();
multiply.disabled = true;
autoclick.disabled = true;
bonus.disabled = true;

click.addEventListener('click', increaseScore);
multiply.addEventListener('click', increaseMultiplier);
autoclick.addEventListener('click', enableAutoclick);
bonus.addEventListener('click', enableBonus);
autoclickInterval = window.setInterval(autoclickF, 1000);
bonusInterval = window.setInterval(bonusF, 1000);
var CookieAutoclicker = (function() {
    function CookieAutoclicker() {}

    CookieAutoclicker.EnabledClassRegex = /\b(?:enabled)\b/;
    CookieAutoclicker.StoreSectionClassRegex = /\b(?:storeSection)\b/;
    
    CookieAutoclicker.WrathCookieRegex = /wrathCookie\.png/;
    
    CookieAutoclicker.ElderRegex = /elder/i;

    CookieAutoclicker.UpgradeVsProductCoefficient = 1.24;

    CookieAutoclicker.ClickCookie = function() {
        var bigCookie = document.getElementById("bigCookie");
        if (bigCookie === null)
            return;

        bigCookie.click();
    };

    CookieAutoclicker.ClickGoldenCookie = function() {
        var goldenCookie = document.getElementById("goldenCookie");
        if (goldenCookie === null)
            return;
        
        var isWrathCookie = CookieAutoclicker.WrathCookieRegex.test(goldenCookie.style.background);
        if (isWrathCookie)
            return;

        goldenCookie.click();
    };

    CookieAutoclicker.GetBetterProduct = function() {
        var betterProduct = {
            netWorth: Number.MAX_VALUE,
            price: undefined,
            index: undefined
        }

        Game.ObjectsById.forEach(function(product, index) {
            if (product.locked)
                return;

            var price = product.getPrice();
            var netWorth = price / product.storedCps;
            if (netWorth < betterProduct.netWorth) {
                betterProduct.netWorth = netWorth;
                betterProduct.price = price;
                betterProduct.index = index;
            }
        });

        if (betterProduct.index === undefined)
            return undefined;

        return betterProduct;
    };

    CookieAutoclicker.GetFirstAvailableUpgrade = function() {
        var found = undefined;
        Game.UpgradesInStore.forEach(function (upgrade, index) {
            if (found)
                return;
            
            var isElderRelatedUpgrade = CookieAutoclicker.ElderRegex.test(upgrade.name);
            if (isElderRelatedUpgrade) // temporary disabled elder-related upgrades
                return;
            
            found = {
                upgrade: upgrade,
                index: index
            };
        });
        
        if (found === undefined)
            return undefined;

        var price = found.upgrade.getPrice();
        return {
            price: price,
            index: found.index
        };
    };

    CookieAutoclicker.GetProductElementByIndex = function(index) {
        var productElements = document.getElementsByClassName("product");
        return productElements[index];
    };

    CookieAutoclicker.GetUpgradeElementByIndex = function(index) {
        var upgradeElements = document.getElementsByClassName("upgrade");
        if (upgradeElements.length === 0)
            return undefined;

        var upgradeElementsArray = [].slice.call(upgradeElements);
        var currentIndex = 0;
        var found = undefined;

        upgradeElementsArray.forEach(function(element) {
            var isInStoreSection = CookieAutoclicker.StoreSectionClassRegex.test(element.parentNode.className);
            if (isInStoreSection === true && index === currentIndex++)
                found = element;
        });

        return found;
    };

    CookieAutoclicker.GetNextPurchaseElement = function() {
        var product = CookieAutoclicker.GetBetterProduct();
        var upgrade = CookieAutoclicker.GetFirstAvailableUpgrade();

        if (product === undefined) {
            if (upgrade !== undefined)
                return CookieAutoclicker.GetUpgradeElementByIndex(upgrade.index);

            return undefined;
        }

        if (upgrade !== undefined && upgrade.price / CookieAutoclicker.UpgradeVsProductCoefficient < product.price)
            return CookieAutoclicker.GetUpgradeElementByIndex(upgrade.index);

        return CookieAutoclicker.GetProductElementByIndex(product.index);
    };

    CookieAutoclicker.PurchaseBestGoodsIfAvailable = function() {
        var element = CookieAutoclicker.GetNextPurchaseElement();
        if (element === undefined)
            return;

        if (CookieAutoclicker.EnabledClassRegex.test(element.className) === false)
            return;

        element.click();

        if (this.runned === true)
            setTimeout(CookieAutoclicker.PurchaseBestGoodsIfAvailable, 0);
    };
    
    CookieAutoclicker.KillWrinklers = function() {
        Game.wrinklers.forEach(function (wrinkler) {
            if (wrinkler.close) {
                // TODO: create script that can kill Wrinklers
            }
        })
    }

    CookieAutoclicker.prototype.Run = function() {
        if (Game === undefined) {
            alert("Cookie Clicker game not found.");
            return;
        }

        if (this.runned === true)
            return;

        this.clickCookieIntervalId = setInterval(CookieAutoclicker.ClickCookie, 0);
        this.clickGoldenCookieIntervalId = setInterval(CookieAutoclicker.ClickGoldenCookie, 100);
        this.purchaseIntervalId = setInterval(CookieAutoclicker.PurchaseBestGoodsIfAvailable, 100);
        this.killWrinklersIntervalId = setInterval(CookieAutoclicker.KillWrinklers, 100);
        this.runned = true;
    };

    CookieAutoclicker.prototype.Stop = function() {
        if (this.runned === false)
            return;

        clearInterval(this.clickCookieIntervalId);
        clearInterval(this.clickGoldenCookieIntervalId);
        clearInterval(this.purchaseIntervalId);
        clearInterval(this.killWrinklersIntervalId);
        this.runned = false;
    };

    return CookieAutoclicker;
})()

var autoclicker = new CookieAutoclicker;
autoclicker.Run();
