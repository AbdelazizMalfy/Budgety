
//-------------------------------------------------- BUDGET MODULE -----------------------------------------------------------------------------------------

var budgetctrl = (function(){
    var Expense = function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage = -1 ; 
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0 ) {
            this.percentage = Math.round((this.value / totalIncome) * 100) ;
        }
    };

    Expense.prototype.getPercent = function(){
        return this.percentage;
    }
    

    var Income = function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    };

    function calculateTotal(type){
        var sum = 0 ; 
        data.allItems[type].forEach(function(cur){
            sum += cur.value ; 
        });
        data.totals[type]= sum;
    }

    var data = {
        allItems : {
            exp : [],
            inc : []
        },
        totals : {
            exp : 0 ,
            inc : 0 
        },
        budget : 0,
        percentage : -1 
    }   
    return { 
        addItem : function(type,des,val){
            var ID, newItem;

            if(data.allItems[type].length === 0 ){
                ID = 0 ;
            } else {
                ID = data.allItems[type][data.allItems[type].length - 1 ].id + 1  ;
            }

            if ( type === "exp"){
                newItem = new Expense(ID , des , val);
            } else if ( type === "inc"){
                newItem = new Income(ID , des , val);

            }
            data.allItems[type].push(newItem);
            return newItem;
        }, 

        deleteItem: function(type , id){
            var ids , index;

            ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if ( index !== -1 ){
                data.allItems[type].splice(index,1);
            }

        },

        calculateBudget : function(){
            //calc total income and expenses 
            calculateTotal('inc');
            calculateTotal('exp');

            //clac the budget : income - expenses 
            data.budget = data.totals.inc - data.totals.exp;
            // calc the % : expenses % income * 100     
            if (data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100) ;
            } else {
                data.percentage = -1 ;
            }

        },
        calculatePercentages : function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
            
        }, getPercentages : function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return  cur.getPercent();
            });
            return allPerc;
        },

        getBugdet : function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp, 
                percentage: data.percentage
            }
        },

        testing : function(){
            console.log(data);
        }



    }

})();

//--------------------------------------------------  UI MODULE ------------------------------------------------------------------------------------------------------------

var UICtrl = (function(){
    var DOMstrings = {
        type : ".add__type",
        description : ".add__description",
        value:".add__value",
        btn:".add__btn",
        incomeContainer : ".income__list",
        expenseContainer : ".expenses__list",
        budgetLabel:".budget__value",
        incomeLabel : ".budget__income--value",
        expensesLabel :".budget__expenses--value",
        percentageLabel : ".budget__expenses--percentage",
        container: ".container",
        pecentageLabel : ".item__percentage",
        dateLabel : ".budget__title--month"
    }
    function numFormat(num , type){
        var numSplit, int , decimal;

        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split(".");

        int = numSplit[0];
        if ( int.length > 3 ){
            int = int.substr(0, int.length - 3 ) + "," + int.substr(int.length- 3 , 3 );
        }


        decimal = numSplit[1];

        return (type === "exp" ? '-' : '+') + " " + int + "." + decimal ;
        
    }


    return{ 
        getInput: function(){

            return {
            type : document.querySelector(DOMstrings.type).value, // we get inc or exp
            description : document.querySelector(DOMstrings.description).value,
            value : parseFloat(document.querySelector(DOMstrings.value).value)
            }            
       } , getDOMstrings : function (){
            return DOMstrings;
       },
       displayItem : function(obj , type){
        //1 html 
        var html , newHtml , element ;
        if ( type === "inc"){
            element = DOMstrings.incomeContainer ; 
            html ='<div class="item clearfix" id="inc-%id%"><div class="item__description">%des%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>'
        } else if ( type === "exp"){
            element = DOMstrings.expenseContainer;
            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%des%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
        }

        // 2 //  replace html
        newHtml = html.replace("%id%" , obj.id);
        newHtml = newHtml.replace("%des%" , obj.description);
        newHtml = newHtml.replace("%value%" , numFormat(obj.value));

        // 3 insert html to the DOM 
        document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
       }, 
       clearInputs : function(){
           document.querySelector(DOMstrings.description).value = "";
           document.querySelector(DOMstrings.value).value = "" 
       },
       displayBudget : function(obj){
        var type;

        obj.budget > 0 ? type = "inc" : type = "exp" ;

        
        document.querySelector(DOMstrings.budgetLabel).textContent = numFormat(obj.budget,type);
        document.querySelector(DOMstrings.incomeLabel).textContent = numFormat(obj.totalInc,"inc");
        document.querySelector(DOMstrings.expensesLabel).textContent = numFormat(obj.totalExp,"exp");
        if ( obj.percentage > 0 ){
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
        } else {
            document.querySelector(DOMstrings.percentageLabel).textContent = "---";
        }
       },

       displayPercentages : function(percentages){
        var percentageFields = document.querySelectorAll(DOMstrings.pecentageLabel);

        function NodeListforEach(list, callback){
            for (var i = 0 ; i <list.length ; i++){
                callback(list[i], i );
            }
        }

        NodeListforEach(percentageFields , function(cur,index){
            if (percentages[index]> 0){
                cur.textContent = percentages[index]+ " %";
            } else {
                cur.textContent = "---";
            }
        })

       },
       UIDeleteItem : function(fullID){
        var el; 
        el = document.getElementById(fullID);
        el.parentNode.removeChild(el);
       },

       displayDate: function(){
           var now, year , month , months ; 
            months = [ "Jan" , "feb" , "March" , "April" , "May", "June", "July" , "Augest" , "September", "October" , "Nov" , "Dec"]
           now = new Date();
           year = now.getFullYear();
           month = now.getMonth();
           document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year ;
       },
       changedType: function (){
           document.querySelector(DOMstrings.type).classList.toggle("red-focus");
           document.querySelector(DOMstrings.description).classList.toggle("red-focus");
           document.querySelector(DOMstrings.value).classList.toggle("red-focus");
           document.querySelector(DOMstrings.btn).classList.toggle("red");
           
       }

    }
})();

//--------------------------------------------------  APP CONTROLLER MODULE -------------------------------------------------------------------------------------------

var appCtrl = (function(budget,UI){
    
    
    function updateBudget(){
        // 5 // calculate the new budget 
        budgetctrl.calculateBudget();
        // 6 // return the budget
        var budget = budgetctrl.getBugdet();          
        // 7 // update the UI  
        UI.displayBudget(budget);
    }    

    function updatePercentages(){
        
        //calc percentages 
        budgetctrl.calculatePercentages();

        // read them from budget controller 
        var percentages = budgetctrl.getPercentages(  );

        // update the user interface
        UICtrl.displayPercentages(percentages);
    };


    // ADD ITEM FUNCTION

    function addItem(){
        var input, newItem;
        // 1 // get inputs value 

            
        input = UI.getInput();
        console.log(input);

            
        if( input.description !== "" && !isNaN(input.value) && input.value > 0){

            // 2 // add items to data structure 
            newItem = budgetctrl.addItem(input.type,input.description,input.value);
            // 3 // add items to UI 
            UICtrl.displayItem(newItem , input.type);
    
            // 4 // CLEAR THE FIELDS
    
            UICtrl.clearInputs();

            // 5 // calc and update budget 
            updateBudget();

            // 6 // update pecentages 
            updatePercentages();
        }
    }


    function deleteItem(event){
        var itemID, splitID , type , ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);   
        }

        // delete from data structure.
        budgetctrl.deleteItem(type,ID);
        // delete from UI 
        UICtrl.UIDeleteItem(itemID);
        // update budget
        updateBudget();

        // update percentages 
        updatePercentages()
    }

    // EVENT LISTENER STARTER 

    function eventListenerStarter(){
        var DOM = UI.getDOMstrings();
        
       document.querySelector(DOM.btn).addEventListener("click",addItem)

       document.addEventListener("keypress" , function(event){
         if (event.keyCode === 13 || event.which === 13) {
            addItem();
          }
      });

      document.querySelector(DOM.container).addEventListener("click", deleteItem);
      document.querySelector(DOM.type).addEventListener("change", UICtrl.changedType);

    }


    // RETURNING INIT FUNCTION 
     
    return{
        init : function(){
            // UI.displayBudget({
            //     budget: 0,
            //     totalInc: 0,
            //     totalExp: 0, 
            //     percentage: -1
            // });
            UICtrl.displayDate();
            eventListenerStarter();
        }
    }
    
    
})(budgetctrl,UICtrl);


appCtrl.init()