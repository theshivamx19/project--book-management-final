const mongoose = require('mongoose')
const ReviewModel = require("../models/reviewmodel")
const BookModel = require("../models/bookmodel")

let dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/

exports.createReview = async (req, res) => {
    try {

        let bookIDinPath = req.params.bookId

        let valid = mongoose.Types.ObjectId.isValid(bookIDinPath)
        if (valid == false) {
            return res.status(400).send({ status: false, message: "Enter a valid book id" })
        }

        let bookData = await BookModel.findOne({ isDeleted: false, _id: bookIDinPath })

        if (!bookData) return res.status(404).send({ status: false, message: "Book not found" })


        let bodyData = req.body
        let { bookId, reviewedAt, rating } = bodyData

        if (bookIDinPath != bookId) {
            return res.status(400).send({ status: false, message: "Book id must be same inside both path & body" })
        }
        if (Object.keys(bodyData).length == 0) {
            return res.status(400).send({ status: false, message: "Body can not be empty" })
        }
        if (!bookId || bookId == "") {
            return res.status(400).send({ status: false, message: "Please enter bookId" })
        }
        if (!reviewedAt || reviewedAt.trim() == "") {
            return res.status(400).send({ status: false, message: "Please enter reviewedAt " })
        }
        if (!reviewedAt.match(dateRegex)) {
            return res.status(400).send({ status: false, message: "Please enter date in YYYY-MM-DD format" })
        }
        if (!rating || rating == "") {
            return res.status(400).send({ status: false, message: "Please give rating" })
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).send({ status: false, message: "Give a rating between 1 to 5" })
        }

        let review = await ReviewModel.create(bodyData)

        let updatedBook = await BookModel.findOneAndUpdate({ isDeleted: false, _id: bookIDinPath }, { $inc: { reviews: 1 } })

        let bookReview = {
            _id:         updatedBook._id,
            title:       updatedBook.title,
            excerpt:     updatedBook.excerpt,
            userId:      updatedBook.userId,
            category:    updatedBook.category,
            subcategory: updatedBook.subcategory,
            isDeleted:   updatedBook.isDeleted,
            reviews:     updatedBook.reviews,
            releasedAt:  updatedBook.releasedAt,
            createdAt:   updatedBook.createdAt,
            updatedAt:   updatedBook.updatedAt,
            reviewsData: review
        }

        return res.status(201).send({ status: true, message: 'Success', data: bookReview })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}