/* eslint-disable no-useless-catch */
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import { cloneDeep } from 'lodash'
import { labelModel } from '~/models/labelModel'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const getDetails = async (userId, cardId) => {
  try {
    const card = await cardModel.getDetails(userId, cardId)
    if (!card) throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found!')
    return card
  } catch (error) {
    throw error
  }
}

const createNew = async reqBody => {
  try {
    // xu li tuy dac thu
    const newCard = {
      ...reqBody
    }
    // goi tang model xu li ban ghi vao db
    const createdCard = await cardModel.createNew(newCard)
    const getNewCard = await cardModel.findOneById(createdCard.insertedId)
    if (getNewCard) {
      // cap nhat lai mang cardOrderIds
      await columnModel.pushCardOrderIds(getNewCard)
    }
    // tra du lieu ve controller !!!! service luon co return
    return getNewCard
  } catch (error) {
    throw error
  }
}

const update = async (cardId, reqBody, cardCoverFile, userInfo) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    let updatedCard = {}
    if (cardCoverFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(
        cardCoverFile.buffer,
        'KanbanBoard/images'
      )
      // console.log('uploadResult: ', uploadResult)
      updatedCard = await cardModel.update(cardId, {
        cover: uploadResult.secure_url
      })
    } else if (updateData.commentToAdd) {
      // tao du lieu comment to db
      const commentData = {
        ...updateData.commentToAdd,
        userId: userInfo._id,
        userEmail: userInfo.email,
        commentedAt: Date.now()
      }
      updatedCard = await cardModel.unshiftNewComment(cardId, commentData)
    } else if (updateData.incomingMemberInfo) {
      updatedCard = await cardModel.updateMembers(
        cardId,
        updateData.incomingMemberInfo
      )
      // console.log(updatedCard)
    } else if (updateData.updateLabels) {
      updatedCard = await cardModel.updateLabels(
        cardId,
        updateData.updateLabels
      )
    } else if (updateData.updateAttachments) {
      updatedCard = await cardModel.updateAttachments(
        cardId,
        updateData.updateAttachments
      )
    } else {
      updatedCard = await cardModel.update(cardId, updateData)
    }
    // add card labels
    const card = cloneDeep(updatedCard)
    card.labels = await labelModel.getLabelsByIds(updatedCard.cardLabelIds)
    return card
  } catch (error) {
    throw error
  }
}

export const cardService = {
  getDetails,
  createNew,
  update
}
