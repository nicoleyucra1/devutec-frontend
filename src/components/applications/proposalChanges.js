// ¿La propuesta cambia el precio o el plazo del proyecto?
export function proposalChanges(application, budget) {
  const projectBudget = application.projectBudget ?? budget
  const priceChanged = projectBudget != null && Number(application.proposedPrice) !== Number(projectBudget)
  const deadlineChanged = Boolean(
    application.proposedDeadline && application.projectDeadline && application.proposedDeadline !== application.projectDeadline,
  )
  return priceChanged || deadlineChanged
}
