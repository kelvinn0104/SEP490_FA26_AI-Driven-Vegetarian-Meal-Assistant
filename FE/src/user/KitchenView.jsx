import { useState } from "react";
import { X, Leaf, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { amount } from "./data";
import { Dialog } from "./ui";

export function KitchenView({ recipe, servings, onClose }) {
  const [checked, setChecked] = useState([]);
  const ingredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
    : [];
  const factor = servings / (Number(recipe.servings) || 1);
  return (
    <Dialog
      title={recipe.title}
      close={onClose}
      className="vp-kitchen"
      heading={false}
    >
      <div className="vp-kitchen-inner">
        <header>
          <div>
            <span className="vp-eyebrow">
              <Leaf size={14} /> Trong bếp
            </span>
            <h1 id="kitchen-title">{recipe.title}</h1>
            <p>
              {servings} khẩu phần · Đánh dấu nguyên liệu đã chuẩn bị để nấu dễ
              hơn.
            </p>
          </div>
          <button
            className="vp-icon"
            onClick={onClose}
            aria-label="Đóng chế độ nấu ăn"
          >
            <X size={21} />
          </button>
        </header>
        <div className="vp-kitchen-columns">
          <section className="vp-kitchen-ingredients">
            <div className="vp-section-heading">
              <h2>Chuẩn bị</h2>
              {ingredients.length > 0 && (
                <span aria-live="polite">
                  {checked.length}/{ingredients.length}
                </span>
              )}
            </div>
            {ingredients.length ? (
              ingredients.map((item, i) => (
                <label
                  className={`vp-check ${checked.includes(i) ? "is-ready" : ""}`}
                  key={item.ingredientId || i}
                >
                  <input
                    type="checkbox"
                    checked={checked.includes(i)}
                    onChange={(e) =>
                      setChecked((previous) =>
                        e.target.checked
                          ? [...previous, i]
                          : previous.filter((v) => v !== i),
                      )
                    }
                  />
                  <span>
                    {item.name || item.ingredientName}
                    <small>
                      {amount(item.quantityG ?? item.quantity, factor)}{" "}
                      {item.unit || "g"}
                    </small>
                  </span>
                </label>
              ))
            ) : (
              <p>Công thức chưa có định lượng nguyên liệu.</p>
            )}
            {checked.length > 0 && (
              <button className="vp-text-button" onClick={() => setChecked([])}>
                <RotateCcw size={14} />
                Đánh dấu lại từ đầu
              </button>
            )}
          </section>
          <section>
            <span className="vp-eyebrow">Từng bước một</span>
            <h2>Cách nấu</h2>
            <div className="vp-prose">
              {recipe.instructions ? (
                <ReactMarkdown>{recipe.instructions}</ReactMarkdown>
              ) : (
                <p>Chưa có hướng dẫn nấu cho công thức này.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </Dialog>
  );
}
