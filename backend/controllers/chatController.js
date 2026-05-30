const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Property = require('../models/Property');

const startConversation = async (req, res) => {
    try {
        const { propertyId, receiverId } = req.body;
        const senderId = req.user._id;

        let conversation = await Conversation.findOne({
            propertyId,
            participants: { $all: [senderId, receiverId] }
        })
        .populate('participants', 'fullName email')
        .populate('propertyId', 'title images'); 

        if (conversation) {
            return res.json({
                success: true,
                conversation,
                isNew: false
            });
        }

        conversation = await Conversation.create({
            propertyId,
            participants: [senderId, receiverId]
        });

        await conversation.populate('participants', 'fullName email');
        await conversation.populate('propertyId', 'title images'); 

        res.status(201).json({
            success: true,
            conversation,
            isNew: true
        });
    } catch (error) {
        console.error('Start Conversation Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error starting conversation'
        });
    }
};

const getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user._id
        })
        .populate('participants', 'fullName email')
        .populate('propertyId', 'title images')
        .sort('-lastMessageAt');

        res.json({
            success: true,
            conversations
        });
    } catch (error) {
        console.error('Get Conversations Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching conversations'
        });
    }
};

const getMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user._id, receiver: { $in: [req.user._id] } },
                { receiver: req.user._id }
            ]
        })
        .where('propertyId')
        .equals(req.params.id)
        .populate('sender', 'fullName')
        .sort('createdAt');

        res.json({
            success: true,
            messages
        });
    } catch (error) {
        console.error('Get Messages Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching messages'
        });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { conversationId, propertyId, receiverId, message } = req.body;

        const newMessage = await Message.create({
            propertyId,
            sender: req.user._id,
            receiver: receiverId,
            message
        });

       
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: message.substring(0, 100),
            lastMessageAt: Date.now()
        });

        await newMessage.populate('sender', 'fullName');

        res.status(201).json({
            success: true,
            message: newMessage
        });
    } catch (error) {
        console.error('Send Message Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending message'
        });
    }
};

module.exports = {
    startConversation,
    getConversations,
    getMessages,
    sendMessage
};