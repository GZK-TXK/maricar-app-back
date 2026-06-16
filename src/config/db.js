import mongoose from "mongoose";

const mongoConexion = async () => {
  try {
        await mongoose.connect(process.env.MONGODB_URI);

      console.log("Data Base succesfully connected.")
    
  } catch (error) {
      console.log(error)
      process.exit(1);
  }
};

export default mongoConexion