//jshint esversion: 6
const express=require("express");
const bodyParser= require("body-parser");
const mongoose= require("mongoose");
const _= require("lodash");

const app=express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://akshatdutta5557:Akshat5557@cluster0.n5qbqpd.mongodb.net/toDoListDB", {useNewUrlParser: true});

const itemsSchema= {
    name: String
};

const Item= mongoose.model("Item", itemsSchema);

const default_item1= new Item ({
    name: "Welcome to your To-Do-List"
});
const default_item2= new Item ({
    name: 'Use "New Item" for new entries'
});
const default_item3= new Item ({
    name: "You Can Do It!"
});
const default_items= [default_item1, default_item2,default_item3];

const listSchema={
    name: String,
    items: [itemsSchema]
};

const List= mongoose.model("List",listSchema);



app.get("/", function(req,res){
    var today= "Today";
    
    
    Item.find({}).then(function(items){
        
    if(items.length==0){
       
        Item.insertMany(default_items).then(function () {
            console.log("working");
            console.log("Successfully saved defult items to DB");
            console.log(Item);
            }).catch(function (err) {
            console.log(err);
        });
        res.redirect("/");
    }
    });

    Item.find({}).then( function(items){
        
        res.render("list", {kindOfDay: today, newListItems: items} );
    });
    
});


app.get("/:customListName", function(req,res){
   
    var customListName= _.capitalize(req.params.customListName);
    List.findOne({name: customListName}).then( function(foundList){
        if(!foundList){
            const list= new List({
                name: customListName,
                items: default_items
            });
            list.save();
            
            res.redirect("/"+ customListName);
        }
        else{
            res.render("list", {kindOfDay: foundList.name, newListItems: foundList.items} );
        }
    })
});


app.post("/", function(req,res){
    var itemName= req.body.newItem;
    var listName= req.body.button;

    const newItem= new Item({
        name: itemName
    });

    if(listName== "Today"){
        newItem.save();
        res.redirect("/");
    }else{
        List.findOne({name: listName}).then(function(foundList){
            console.log(foundList.name);
            console.log(foundList.items);
            foundList.items.push(newItem);
            foundList.save();
            res.redirect("/"+ listName);
        });
    }
    
});


app.post("/delete", async function (req, res) {
    let checkedItemId = req.body.checkbox;
    const listName= req.body.listName;

    if(listName=="Today"){
        if(checkedItemId != undefined){
            await Item.findByIdAndRemove(checkedItemId)
            .then(()=>console.log(`Deleted ${checkedItemId} Successfully`))
            .catch((err) => console.log("Deletion Error: " + err));
            res.redirect("/");
            }
    }else{
        List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}).then( function(){
            res.redirect("/"+ listName);
        });
    }

  });


app.listen(3000, function(){
    console.log("Server started on port 3000");
});
