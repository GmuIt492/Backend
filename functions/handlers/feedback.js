const { db } = require('../util/admin');

//get all feedback method
exports.getAllFeedback = (request,response) => {
	//db query to get all feedback
    db.collection('feedback')
	.orderBy('createdAt', 'desc')
	.get()
	.then(data => {
		let feedback = [];
		//for each post, push fields into array
		data.forEach((doc) => {
			feedback.push({
				postId: doc.id,
				body: doc.data().body,
				createdAt: doc.data().createdAt
			});
		});
		//returns post array
		return response.json(feedback);
	})
	.catch((err) => {
		console.error(err);
		response.status(500).json({ error: err.code});
	});
}

//create feedback method
exports.createFeedback = (request,response) => {
    //validate body
    if(request.body.body.trim() === ''){
        return response.status(400).json({ body: 'must not be empty'});
    }

    //db fields to create feedback
    const newFeedback = {
        body: request.body.body,
        createdAt: new Date().toISOString()
    };

    //take json to add to db
    db.collection('feedback')
	.add(newFeedback)
	.then(doc => {
		const feedbackResponse = newFeedback;
		feedbackResponse.feedbackId = doc.id;
		response.json(feedbackResponse);
	})
	.catch(err => {
		response.status(500).json({ error: 'something went wrong'});
		console.error(err);
	});
}

//get single post details method
exports.getFeedback = (request,response) => {
    let postData = {};

    //get post details from db
    db.doc(`/posts/${request.params.postId}`).get()
    .then((doc) => {
        if(!doc.exists){
            return response.status(404).json({ error: 'post not found'});
        }
        postData = doc.data();
        postData.postId = doc.id;
        return db.collection('comments')
        .orderBy('createdAt', 'desc')
        .where('postId', '==', request.params.postId)
        .get();
    })
    //push comments into array into post details
    .then((data) => {
        postData.comments = [];
        data.forEach((doc) => {
            postData.comments.push(doc.data());
        })
    return response.json(postData);
    })
    .catch(err => {
        console.error(err);
        return response.status(500).json({ error: err.code })
    })
}

//delete post method
exports.deleteFeedback = (request,response) => {
    const document = db.doc(`/posts/${request.params.postId}`);
    
    //get document
    document.get()
	//validate if post exist
	.then((doc) => {
		if(!doc.exists){
			return response.status(404).json({ error: 'post not found'});
		}
		//get authorization to delete
		if(doc.data().userHandle !== request.user.handle){
			return response.status(403).jso({ error: 'unauthorized'});
		}
		else {
			return document.delete();
		}
	})
	.then(() => {
		response.json({ mesage: 'post deleted successfully'});
	})
	.catch((err) => {
		console.error(err);
		return response.status(500).json({ error: err.code });
	})
}