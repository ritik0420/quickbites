import mongoose from "mongoose";

export const connectDB =async () => {
    await mongoose.connect('mongodb+srv://ritikkaintura:8433148843@cluster0.chqly.mongodb.net/food-del').then(()=>console.log("DB connected"));
}