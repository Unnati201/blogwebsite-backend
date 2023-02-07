const express = require("express");
const { connection } = require("../connection");
const verify = require("../middleware/verify");
const {ObjectId} = require("mongodb");


const router = express.Router();

//Get all the blog route
router.get("/all", verify, async (req, res) => {
  const { db } = await connection();

  const blogs = await db.collection("blogs").find({}).toArray();

  if (!blogs) {
    return res.send({ message: "No blogs found!", isSuccess:false });
  }

  return res.send({ message: "Successfully got blogs", blogs,isSuccess:true });
});



//Get a specific blog
router.get("/getOne/:id", verify, async (req, res) => {
  
    const { db } = await connection();

    const id = req.params.id;

    const blogs = await db
      .collection("blogs")
      .findOne({ _id: ObjectId(id) })

      if (!blogs) {
        return res.send({
          message: `Blog  does not exists`,isSuccess:false,
        });
      }
  
       return res.send({ message: "Successfully got blogs", blogs, isSuccess:true });
   
  });
  
  //Create a blog
router.post("/addblog", verify, async (req, res) => {
  const { db } = await connection();
  const { title, content, category, author } = req.body;

  //Checking for empty values
  if (!title || !content ||  !category || !author ) {
    return res.send({
      message: "Please fill all the details",
      isSuccess: false,
    });
  }
  



  //saving a single blog
  await db.collection("blogs").insertOne({
    title,
    content,
    category,
    author,
  
  });

  return res.status(201).json({
    message: "Successfully created a blog",
    isSuccess: true,
  });
});


//Update a user route
router.put("/edit/:id", verify, async (req, res) => {

    const { db } = await connection();
    const { title,content,category,author} = req.body;

    
    const id = req.params.id;

    if(!title || !content || !category || !author){
      return res.send({
        message:"please fill all the details",
        isSuccess:false,
      });
    }

 const blogs=await db.collection("blogs").findOne({_id :ObjectId(id)});
 
 if(!blogs){
  return res.send({message:"blog not found", isSuccess:false});
 }

    await db
      .collection("blogs")
      .updateOne({ _id: ObjectId(id) }, { $set: { title,content,category,author} });

    return res.send({ message: "Successfully updated a blog",isSuccess:true });
  
 
});

router.delete("/deleteOne/:id", verify, async (req, res) => {

    const { db } = await connection();
    const id = req.params.id;

    const blogExists = await db
      .collection("blogs")
      .findOne({ _id: ObjectId(id) });

    

    if (blogExists) {
      const deletedBlogs = await db
        .collection("blogs")
        .deleteOne({ _id: ObjectId(id) });

      return res.send({ message: "Successfully deleted a blogs", deletedBlogs });
    } else {
      return res.send({ message: "Blog does not exits!" });
    }
  
});


module.exports = router;
