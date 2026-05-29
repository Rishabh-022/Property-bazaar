const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Property = require('../models/Property');

// @desc    Start a conversation or get existing one
// @route   POST /api/chat/conversations
// @access  Private
const startConversation = async (req, res) => {
    try {
        const { propertyId, receiverId } = req.body;
        const senderId = req.user._id;

        // ✅ FIX: populate even existing conversation
        let conversation = await Conversation.findOne({
            propertyId,
            participants: { $all: [senderId, receiverId] }
        })
        .populate('participants', 'fullName email')
        .populate('propertyId', 'title images'); // <-- ADD THIS LINE

        if (conversation) {
            return res.json({
                success: true,
                conversation,
                isNew: false
            });
        }

        // Create new conversation (already populates below)
        conversation = await Conversation.create({
            propertyId,
            participants: [senderId, receiverId]
        });

        await conversation.populate('participants', 'fullName email');
        await conversation.populate('propertyId', 'title images'); // <-- ensure new also populated

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

// @desc    Get all conversations for a user
// @route   GET /api/chat/conversations
// @access  Private
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

// @desc    Get messages for a conversation
// @route   GET /api/chat/conversations/:id/messages
// @access  Private
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

// @desc    Send a message
// @route   POST /api/chat/messages
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { conversationId, propertyId, receiverId, message } = req.body;

        const newMessage = await Message.create({
            propertyId,
            sender: req.user._id,
            receiver: receiverId,
            message
        });

        // Update conversation
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