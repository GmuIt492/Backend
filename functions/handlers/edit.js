const { db } = require('../util/admin');

//get header method
exports.getHeader = (response) => {
	//db query to get header
    db.collection('header')
	.orderBy('createdAt', 'desc')
	.get()
	.then(data => {
		let header = [];
		//for each header, push fields into array
		data.forEach((doc) => {
			header.push({
				headerId: doc.id,
				body: doc.data().body,
				createdAt: doc.data().createdAt
			});
		});
		//returns header array
		return response.json(header);
	})
	.catch((err) => {
		console.error(err);
		response.status(500).json({ error: err.code});
	});
}

//create header method
exports.createHeader = (request,response) => {
    //validate body
    if(request.body.body.trim() === ''){
        return response.status(400).json({ body: 'Must not be empty'});
    }

    //db fields to create header
    const newHeader = {
        body: request.body.body,
        createdAt: new Date().toISOString()
    };

    //take json to add to db
    db.collection('header')
	.add(newHeader)
	.then(doc => {
		const headerResponse = newHeader;
		headerResponse.headerId = doc.id;
		response.json(headerResponse);
	})
	.catch(err => {
		response.status(500).json({ error: 'Something went wrong'});
		console.error(err);
	});
}

//delete header method
exports.deleteHeader = (response) => {
    //db query to get header
    db.collection('header')
    .get()
	.then(data => {
		//for each header, delete
		data.forEach((doc) => {
			doc.ref.delete();
		});
	})
    .then(() => {
		response.json({ message: 'Feedback deleted successfully'});
	})
	.catch((err) => {
		console.error(err);
		response.status(500).json({ error: err.code});
	});
}

//get hours method
exports.getHour = (request,response) => {
	//db query to get hour
    db.collection('hour')
	.orderBy('createdAt', 'desc')
	.get()
	.then(data => {
		let hour = [];
		//for each hour, push fields into array
		data.forEach((doc) => {
			hour.push({
				hourId: doc.id,
				body: doc.data().body,
				createdAt: doc.data().createdAt
			});
		});
		//returns hour array
		return response.json(hour);
	})
	.catch((err) => {
		console.error(err);
		response.status(500).json({ error: err.code});
	});
}

//create hours method
exports.createHour = (request,response) => {
    //validate body
    if(request.body.body.trim() === ''){
        return response.status(400).json({ body: 'Must not be empty'});
    }

    //db fields to create hours
    const newHour = {
        body: request.body.body,
        createdAt: new Date().toISOString()
    };

    //take json to add to db
    db.collection('hour')
	.add(newHour)
	.then(doc => {
		const hourResponse = newHour;
		hourResponse.hourId = doc.id;
		response.json(hourResponse);
	})
	.catch(err => {
		response.status(500).json({ error: 'Something went wrong'});
		console.error(err);
	});
}