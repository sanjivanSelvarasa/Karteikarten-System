const learningSetService = require('../3_services/learningSet.service');

function createLearningSet(req, res, next) {
  try {
    const data = learningSetService.createForUser(req.user.userId, req.body || {});
    res.status(201).json({
      ok: true,
      message: 'Learning set created',
      data: { learningSet: data },
    });
  } catch (error) {
    next(error);
  }
}

function listLearningSets(req, res, next) {
  try {
    const data = learningSetService.listForUser(req.user.userId);
    res.status(200).json({
      ok: true,
      data: { learningSets: data },
    });
  } catch (error) {
    next(error);
  }
}

function getLearningSet(req, res, next) {
  try {
    const setId = Number(req.params.setId);
    const data = learningSetService.getOneForUser(req.user.userId, setId);
    res.status(200).json({
      ok: true,
      data: { learningSet: data },
    });
  } catch (error) {
    next(error);
  }
}

function updateLearningSet(req, res, next) {
  try {
    const setId = Number(req.params.setId);
    const data = learningSetService.updateForUser(req.user.userId, setId, req.body || {});
    res.status(200).json({
      ok: true,
      message: 'Learning set updated',
      data: { learningSet: data },
    });
  } catch (error) {
    next(error);
  }
}

function deleteLearningSet(req, res, next) {
  try {
    const setId = Number(req.params.setId);
    learningSetService.removeForUser(req.user.userId, setId);
    res.status(200).json({
      ok: true,
      message: 'Learning set deleted',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createLearningSet,
  listLearningSets,
  getLearningSet,
  updateLearningSet,
  deleteLearningSet,
};
