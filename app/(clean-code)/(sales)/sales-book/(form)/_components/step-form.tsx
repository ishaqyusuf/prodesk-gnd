interface Props {
    stepUid?;
}
export function StepForm({ stepUid }: Props) {
    return (
        <div>
            <div className="mx-4">{stepUid}</div>
        </div>
    );
}
