const { db } = require('../util/admin');

//get all feedback method
exports.getAllFeedback = (response) => {
	//db query to get all feedback
    db.collection('feedback')
	.orderBy('createdAt', 'desc')
	.get()
	.then(data => {
		let feedback = [];
		//for each feedback, push fields into array
		data.forEach((doc) => {
			feedback.push({
				feedbackId: doc.id,
				body: doc.data().body,
				createdAt: doc.data().createdAt
			});
		});
		//returns feedback array
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
        return response.status(400).json({ body: 'Must not be empty'});
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
		response.status(500).json({ error: 'Something went wrong'});
		console.error(err);
	});
}

//delete feedback method
exports.deleteFeedback = (request,response) => {
    const document = db.doc(`/feedback/${request.params.feedbackId}`);
    
    //get document
    document.get()
	//validate if feedback exist
	.then((doc) => {
		if(!doc.exists){
			return response.status(404).json({ error: 'Feedback not found'});
		}
		//get authorization to delete
		if(doc.data().userHandle !== request.user.handle){
			return response.status(403).json({ error: 'Unauthorized'});
		}
		else {
			return document.delete();
		}
	})
	.then(() => {
		response.json({ message: 'Feedback deleted successfully'});
	})
	.catch((err) => {
		console.error(err);
		return response.status(500).json({ error: err.code });
	})
}