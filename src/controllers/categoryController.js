import Category from '../models/Category.js';
import SubCategory from '../models/SubCategory.js';

const DEFAULT_CATEGORIES = [
  {
    name: 'Climate & Environment',
    slug: 'climate-environment',
    description: 'Learn about climate change, conservation, and environmental science.',
    icon: '🌍',
  },
  {
    name: 'Sustainable Living',
    slug: 'sustainable-living',
    description: 'Daily habits, zero waste, and eco-friendly choices.',
    icon: '🌱',
  },
  {
    name: 'Renewable Energy',
    slug: 'renewable-energy',
    description: 'Solar, wind, and clean energy systems.',
    icon: '⚡',
  },
  {
    name: 'Green Business',
    slug: 'green-business',
    description: 'Sustainability in business and ESG.',
    icon: '💼',
  },
];

const DEFAULT_SUBCATEGORIES = {
  'climate-environment': ['Climate Science', 'Conservation', 'Biodiversity', 'Policy & Action'],
  'sustainable-living': ['Zero Waste', 'Eco Home', 'Sustainable Fashion', 'Green Food'],
  'renewable-energy': ['Solar Power', 'Wind Energy', 'Energy Storage', 'Smart Grid'],
  'green-business': ['ESG', 'Circular Economy', 'Carbon Accounting', 'Green Marketing'],
};

async function seedCategoriesIfEmpty() {
  const count = await Category.countDocuments();
  if (count > 0) return;

  const inserted = await Category.insertMany(DEFAULT_CATEGORIES);
  for (const cat of inserted) {
    const subNames = DEFAULT_SUBCATEGORIES[cat.slug] || [];
    const subs = subNames.map((name, i) => ({
      categoryId: cat._id,
      name,
      slug: `${cat.slug}-${name.toLowerCase().replace(/\s+/g, '-')}-${i}`,
      isActive: true,
    }));
    await SubCategory.insertMany(subs);
  }
}

export const getCategoriesWithSubcategories = async (req, res) => {
  try {
    await seedCategoriesIfEmpty();

    const categories = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
    const subcategories = await SubCategory.find({ isActive: true }).lean();
    const subByCategory = {};
    for (const sub of subcategories) {
      const cid = sub.categoryId.toString();
      if (!subByCategory[cid]) subByCategory[cid] = [];
      subByCategory[cid].push({
        _id: sub._id,
        categoryId: sub.categoryId,
        name: sub.name,
        slug: sub.slug,
        description: sub.description,
        isActive: sub.isActive,
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
      });
    }

    const data = categories.map((c) => ({
      _id: c._id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      icon: c.icon,
      isActive: c.isActive,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      subcategories: subByCategory[c._id.toString()] || [],
    }));

    res.status(200).json({ data });
  } catch (err) {
    console.error('[Categories] Error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to load categories.' });
  }
};
