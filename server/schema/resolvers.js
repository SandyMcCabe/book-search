const {User, Book} = require ('../models');
const {AuthenticationError} = require ('apollo-server-express');

const { signToken } = require ('../utils/auth');


const resolvers = {

    Query: {

        me: async (parent, args, context) => {

        if(context.user) {
            const UserData = await User.findOne({_id: context.user._id})
            .select('-__v -password')
            .populate('books')
        
            return UserData;
        }
    throw new AuthenticationError('Try again you are not logged in!!!')

    },
},
Mutation: {
    login: async (parent,{email, password}) => {
        const user = await User.findOne({email});
        if (!user) 
        {
            throw new AuthenticationError('Wrong Credentials');
        }
        const correctPw = await user.isCorrectPassword(password);
        
     if(!correctPw){
        throw new AuthenticationError('Wrong Credentials');
     }
     const token = signToken(user);
     return {token, user};
    },
    addUser: async (parent, arg) =>
    {
        const user = await User.create(args);
        const token = signToken(user);
        return {token, user};
    },

   
    saveBook: async (parent, args, context) => {
        if (context.user) {
       const updatedUser = await User.findByIdAndUpdate (
           { _id: context.user._id},
           { $addToSEt: {savedBooks: args.input}},
           {new: true}

       );
       return updatedUser;
        }
        throw new AuthenticationError('Please log in');
    },
    
        removeBook: async (parent, args, context) => {
            if(context.user) {
        const updatedUser = await User.findOneAndUpdate ( 
            { _id: context.user._id},
            {$pull: {savedBooks: {bookId: args.bookId}}},
            {new: true}   

        );
            return updatedUser;
        }
        throw new AuthenticationError('Please log in');
       }
   }
};
module.exports = resolvers;