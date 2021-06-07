
export const conversationAttributesFragment = `
id
key
state
readAt
priority
createdAt
tagList
firstAgentReply
latestUserVisibleCommentAt
assignee {
  id
  email
  avatarUrl
}
mainParticipant{
  id
  email
  avatarUrl
  properties
  displayName
  kind
}
`
export const converstionMessagesFragment = `
messages(page: $page){
  collection{
    id
    key
    stepId
    triggerId
    fromBot
    message{
      blocks
      data
      state
      htmlContent
      textContent
      serializedContent
      action
    }
    source
    readAt
    createdAt
    privateNote
    appUser{
      id
      email
      avatarUrl
      kind
      displayName
    }
    source
    messageSource {
      name
      state
      fromName
      fromEmail
      serializedContent
    }
    emailMessageId
  }
  meta
}
`
export const conversationLastMessageFragment = `
lastMessage{
  createdAt
  source
  triggerId
  fromBot
  readAt
  message{
    blocks
    data
    state
    htmlContent
    textContent
    serializedContent
  }
  privateNote
  messageSource{
    id
    type
  }
  appUser {
    id
    avatarUrl
    email
    kind
    displayName
  }
}
`
export const conversationFragment = `
conversation(id: $id){
  ${conversationAttributesFragment}
  ${converstionMessagesFragment}
  ${conversationLastMessageFragment}
}
`

export const appFragment = `
encryptionKey
key
name
preferences
logo
inlineNewConversations
timezone
domainUrl
activeMessenger
theme
translations
availableLanguages
teamSchedule
replyTime
customizationColors
inboundSettings
emailRequirement
leadTasksSettings
userTasksSettings
gatherSocialData
registerVisits
domainUrl
outgoingEmailDomain
inboundEmailAddress
customFields
tagList
subscriptionsEnabled
userHomeApps
visitorHomeApps
inboxApps
privacyConsentRequired
segments {
  name
  id
  properties
}
state
tagline
plan
`

export default {
  conversationAttributesFragment,
  converstionMessagesFragment,
  conversationLastMessageFragment,
  conversationFragment,
  appFragment
}