const Revision = require('../models/revision_model');

// LIST OUT ALL THE REVISON PROJECT DETAILS

exports.get_revision_details = async (req, res) => {
  try {
    const revision = await Revision.find({
      projectID: req.params.id,
      'revisions.status': 'open'
    });

    res.status(200).send(revision);
  } catch (error) {
    res.send({ error: error.message });
  }
};

exports.accepting_revision_detaills = async (req, res) => {
  try {
    await Revision.findOneAndUpdate(
      { 'revisions._id': req.params.id },
      { $set: { 'revisions.$.status': 'ongoing' } }
    );

    res.status(200).send('revision detail accepted');
  } catch (error) {
    res.send({ error: error.message });
  }
};

exports.revision_bid = async (req, res) => {
  try {
    await Revision.findOneAndUpdate(
      { 'revisions._id': req.params.id },
      { $set: { 'revisions.$.revisionBidAmount': 2000 } }
    );

    res.status(200).send('Bid placed');
  } catch (error) {
    res.send({ error: error.message });
  }
};

exports.revision_rebid = async (req, res) => {
  try {
    await Revision.findOneAndUpdate(
      { 'revisions._id': req.params.id, 'revisions.rebid': 'true' },
      {
        $set: {
          'revisions.$.revisionBidAmount': 70000,
          'revisions.$.rebid': false
        }
      }
    );

    res.status(200).send('Rebid placed');
  } catch (error) {
    res.send({ error: error.message });
  }
};
