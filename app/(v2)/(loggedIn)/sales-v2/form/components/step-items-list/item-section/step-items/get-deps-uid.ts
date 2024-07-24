export function getDepsUid(stepIndex, formStepArray, stepForm) {
    const dependecies = formStepArray
        .map((s) => ({
            uid: s.step.uid,
            label: s.step.title,
            value: s.item.value,
        }))
        .filter(
            (_, i) =>
                i < stepIndex && stepForm.step.meta?.priceDepencies?.[_.uid]
        );
    const uids = dependecies.map((s) => s.uid);

    return uids.length ? uids.join("-") : null;
}
