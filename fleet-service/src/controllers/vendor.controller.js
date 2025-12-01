import { prisma } from "@shared/db";

export const getVendorsController = async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany(); // fetch all vendors

    return res.status(200).json({
      success: true,
      message: "Vendors fetched successfully",
      data: vendors, // will be [] if no vendors exist
    });
  } catch (error) {
    console.error("Error getting vendors:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
