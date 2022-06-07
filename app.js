
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin_dutta:dutta123@cluster0.3wpum.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
}

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name: "Welcome to your own To-do list."
})

const item2 = new Item({
  name: "Hit the + button to add an item"
});


const item3 = new Item({
  name: "<-- Hit this to delete an item."
})

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);


app.get("/", function(req, res) {
   Item.find({},function(err,itemsFound){

    if(defaultItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
            console.log(err);
        }
        else{
            console.log("Successfully added");
       }
     });
     res.redirect("/");
    }

    else{
      res.render("list", {listTitle:"Today", newListItems: itemsFound}); 
    }
    
  });
  
});


app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if (!foundList){
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save(function(err){
          if(!err){
            res.redirect("/" + customListName);
          }
        });
        
      } else {
        //Show an existing list

        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });



});



app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  console.log(listName);

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } 
  else {
    List.findOne({name: listName}, function(err, foundList){
      if(!foundList){
        console.log("list not found"); 
      }
      else{
        foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
      }
    });
  }
});

app.post("/delete", function(req, res){
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemID, function(err){
      if(!err){
        console.log("Removed successfully!");
        res.redirect("/");
      }
      else{
        console.log(err);
      }
    }); 
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}} }, function(err, foundList){
      if(!err){
        res.redirect("/"+listName);
      }
      else{
      console.log(err);
      }
    });
  } 
   
});




app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started successfully.");
});
