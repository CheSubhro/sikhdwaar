import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import HttpStatus from "../utils/HttpStatus.js";

import { User } from "../models/user.model.js";
import { Gurudwara } from "../models/gurudwara.model.js";
import { Guru } from "../models/guru.model.js";
import { Post } from "../models/post.model.js";
import { Gallery } from "../models/gallery.model.js";
import { Contact } from "../models/contact.model.js";

// =========================================
// Get Admin Dashboard Statistics
// =========================================

const getDashboardStats = asyncHandler(async (req, res) => {
    // Fetch all dashboard statistics simultaneously
    const [
        totalAdmins,
        totalGurudwaras,
        publishedGurudwaras,
        draftGurudwaras,
        totalGurus,
        publishedGurus,
        draftGurus,
        totalPosts,
        publishedPosts,
        draftPosts,
        totalGalleryImages,
        publishedGalleryImages,
        draftGalleryImages,
        totalContacts,
        unreadContacts,
        readContacts,
        repliedContacts,
        recentContacts,
        recentPosts,
    ] = await Promise.all([
        // Admin Statistics
        User.countDocuments(),

        // Gurudwara Statistics
        Gurudwara.countDocuments(),
        Gurudwara.countDocuments({ status: "published" }),
        Gurudwara.countDocuments({ status: "draft" }),

        // Guru Statistics
        Guru.countDocuments(),
        Guru.countDocuments({ status: "published" }),
        Guru.countDocuments({ status: "draft" }),

        // Post Statistics
        Post.countDocuments(),
        Post.countDocuments({ status: "published" }),
        Post.countDocuments({ status: "draft" }),

        // Gallery Statistics
        Gallery.countDocuments(),
        Gallery.countDocuments({ status: "published" }),
        Gallery.countDocuments({ status: "draft" }),

        // Contact Statistics
        Contact.countDocuments(),
        Contact.countDocuments({ status: "unread" }),
        Contact.countDocuments({ status: "read" }),
        Contact.countDocuments({ status: "replied" }),

        // Recent Contacts
        Contact.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select("name email subject status createdAt"),

        // Recent Posts
        Post.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select("title slug type status featuredImage createdAt author")
            .populate("author", "fullName username"),
    ]);

    // Dashboard Response Data
    const dashboardData = {
        admins: {
            total: totalAdmins,
        },

        gurudwaras: {
            total: totalGurudwaras,
            published: publishedGurudwaras,
            draft: draftGurudwaras,
        },

        gurus: {
            total: totalGurus,
            published: publishedGurus,
            draft: draftGurus,
        },

        posts: {
            total: totalPosts,
            published: publishedPosts,
            draft: draftPosts,
        },

        gallery: {
            total: totalGalleryImages,
            published: publishedGalleryImages,
            draft: draftGalleryImages,
        },

        contacts: {
            total: totalContacts,
            unread: unreadContacts,
            read: readContacts,
            replied: repliedContacts,
        },

        recentContacts,
        recentPosts,
    };

    return res
        .status(HttpStatus.OK)
        .json(
            new ApiResponse(
                HttpStatus.OK,
                dashboardData,
                "Dashboard statistics fetched successfully"
            )
        );
});

export { getDashboardStats };
