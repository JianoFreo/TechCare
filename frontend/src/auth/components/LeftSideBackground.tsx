function LeftSideBackground() {
    return (
        <div className="hidden md:flex w-1/2 relative items-center justify-center p-10 text-white">
            <img
                src="assets/image.png"
                alt="TechCare"
                className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-black/40"></div>

            <div className="relative z-10 text-center">
                <h1 className="text-4xl font-bold mb-4">TechCare System</h1>
                <p className="text-white/80">tukmol concept</p>
            </div>
        </div>
    )
}

export default LeftSideBackground