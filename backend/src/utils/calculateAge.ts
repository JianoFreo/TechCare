export function calculateAge(dateOfBirth: string | Date): number {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const hasHadBirthday =
        today.getMonth() > birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() &&
            today.getDate() >= birthDate.getDate());

    if (!hasHadBirthday) {
        age--;
    }

    return age;
}