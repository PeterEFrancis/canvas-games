import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.Rectangle;
import java.awt.image.BufferedImage;
import java.io.File;
import java.util.Scanner;

import javax.imageio.ImageIO;

/**
 * Maze - Maze creation class that uses random, recursive depth-first traversal to "carve out" a random maze, and recursive depth-first search to solve the maze and mark a solution.
 * Methods are included for text and PNG output of the maze.
 * @author Todd W. Neller
 */
public class Maze {

	/**
	 * Constants indicating the status of a maze grid position.
	 * UNREACHED or REACHED indicate that we haven't or have, respectively, made the maze to reach that position.
	 * SOLUTION_PATH indicates that the position is along the maze solution from the upper-left corner to the lower-right.
	 */
	public static final int UNREACHED = 0, REACHED = 1, SOLUTION_PATH = 2;

	/**
	 * Direction constants that index the public static final int arrays.
	 */
	public static final int RIGHT = 0, UP = 1, LEFT = 2, DOWN = 3;

	/**
	 * An array of all direction constants.
	 */
	public static final int[] DIRECTIONS = {RIGHT, UP, LEFT, DOWN};
	/**
	 * ROW_CHANGE[i] is the change in row for DIRECTIONS[i].
	 */
	public static final int[] ROW_CHANGE = {0, -1, 0, 1};
	/**
	 * COL_CHANGE[i] is the change in column for DIRECTIONS[i].
	 */
	public static final int[] COL_CHANGE = {1, 0, -1, 0};

	/**
	 * The number of rows and columns in the maze.
	 */
	private int rows, cols;
	/**
	 * The maze grid, with each position marked UNREACHED, REACHED, or SOLUTION_PATH.
	 */
	private int[][] grid;
	/**
	 * Whether or not the maze is open to the right or down, indexed by the position row and column.
	 */
	private boolean[][] openRight, openDown;

	/**
	 * Construct a maze by randomly, recursively carving out paths.
	 * @param rows number of rows
	 * @param cols number of columns
	 */
	public Maze(int rows, int cols) {
		this.rows = rows;
		this.cols = cols;
		grid = new int[rows][cols];
		openRight = new boolean[rows][cols - 1];
		openDown = new boolean[rows - 1][cols];
		makeMaze(); // create the maze
	}

	/**
	 * Get the number of maze rows.
	 * @return the number of maze rows
	 */
	public int getRows() {
		return rows;
	}

	/**
	 * Get the number of maze columns.
	 * @return the number of maze columns
	 */
	public int getCols() {
		return cols;
	}


	/**
	 * Return UNREACHED, REACHED, or SOLUTION_PATH for the given row and column.
	 * @param row the given row
	 * @param col the given column
	 * @return UNREACHED, REACHED, or SOLUTION_PATH for the given row and column
	 */
	public int getGrid(int row, int col) {
		return grid[row][col];
	}


	/**
	 * Return whether or not a passage is open to the right of the given row and column.
	 * @param row the given row
	 * @param col the given column
	 * @return whether or not a passage is open to the right of the given row and column
	 */
	public boolean getOpenRight(int row, int col) {
		return openRight[row][col];
	}

	/**
	 * Set whether or not a passage is open to the right of the given row and column.
	 * @param row the given row
	 * @param col the given column
	 * @param isOpen whether or not a passage is open to the right of the given row and column
	 */
	public void setOpenRight(int row, int col, boolean isOpen) {
		openRight[row][col] = isOpen;
	}

	/**
	 * Return whether or not a passage is open downward from the given row and column.
	 * @param row the given row
	 * @param col the given column
	 * @return whether or not a passage is open downward from the given row and column
	 */
	public boolean getOpenDown(int row, int col) {
		return openDown[row][col];
	}

	/**
	 * Set whether or not a passage is open downward from the given row and column.
	 * @param row the given row
	 * @param col the given column
	 * @param isOpen whether or not a passage is open downward from the given row and column
	 */
	public void setOpenDown(int row, int col, boolean isOpen) {
		openDown[row][col] = isOpen;
	}

	/**
	 * Return a shuffled list of direction constants.
	 * @return a shuffled list of direction constants
	 */
	private int[] getShuffledDirs() {
		int[] dirs = DIRECTIONS.clone();
		for (int i = dirs.length - 1; i > 0; i--) {
			int j = (int) (Math.random() * (i + 1));
			int tmp = dirs[i];
			dirs[i] = dirs[j];
			dirs[j] = tmp;
 		}
		return dirs;
	}

	/**
	 * Return whether or not the position in the direction from the given position is both in-bounds and unreached.
	 * @param row row of given position
	 * @param col column of given position
	 * @param dir direction from the given position
	 * @return whether or not the position in the direction from the given position is both in-bounds and unreached
	 */
	private boolean isUnreached(int row, int col, int dir) {
		int row2 = row + ROW_CHANGE[dir];
		int col2 = col + COL_CHANGE[dir];
		return (row2 >= 0 && row2 < rows && col2 >= 0 && col2 < cols
				&& grid[row2][col2] == UNREACHED);
	}

	/**
	 * Open a wall in the given direction from the given position.
	 * @param row row of given position
	 * @param col column of given position
	 * @param dir direction from the given positio
	 */
	private void openWall(int row, int col, int dir) {
		int row2 = row + ROW_CHANGE[dir];
		int col2 = col + COL_CHANGE[dir];
		if (row == row2) // columns differ
			openRight[row][col < col2 ? col : col2] = true;
		else // rows differ
			openDown[row < row2 ? row : row2][col] = true;
	}

	/**
	 * Recursively, randomly carve out a maze starting at position [0][0].
	 */
	private void makeMaze() {
		makeMaze(0,0);
	}

	/**
	 * Recursively, randomly carve out a maze from position [row][col].
	 * @param row current maze row
	 * @param col current maze column
	 */
	private void makeMaze(int row, int col) {
		/* Make maze algorithm:
		 * - Mark grid[row][col] as REACHED.
		 * - For each direction in a shuffled list of directions,
		 * -- If the grid is unreached in that direction from [row][col],
		 * --- Open a wall in that direction, and recursively make the maze in the [row2][col2] position in that direction.
		 */

		grid[row][col] = REACHED;
		for (int dir : getShuffledDirs())
			if (isUnreached(row, col, dir)) {
				openWall(row, col, dir);
				makeMaze(row + ROW_CHANGE[dir], col + COL_CHANGE[dir]);
			}
	}

	/**
	 * Return whether or not a person can travel within the maze from position [row][col] in the given direction dir.
	 * @param row given row
	 * @param col given column
	 * @param dir given direction
	 * @return whether or not a person can travel within the maze from position [row][col] in the given direction dir
	 */
	public boolean canTravel(int row, int col, int dir) {
		int row2 = row + ROW_CHANGE[dir];
		int col2 = col + COL_CHANGE[dir];
		return (row2 >= 0 && row2 < rows && col2 >= 0 && col2 < cols
				&& ((row == row2 && openRight[row][col < col2 ? col : col2])
					|| (col == col2 && openDown[row < row2 ? row : row2][col])));
	}

	/**
	 * Recursively solve the maze starting at position [0][0].
	 * When complete, the solution path (if any) will be marked with SOLUTION_PATH in grid.
	 */
	public void solveMaze() {
		// TODO - call the auxialiary/helper function with row 0 and column 0
		// This can be done in one line of code.

	}

	/**
	 * Attempt to solve the maze from the current [row][col] position according to the commented algorithm below.
	 * If successful, the solution path (if any) will be marked with SOLUTION_PATH in grid and we return true.
	 * If not successful, we leave the current grid position as REACHED and return false.
	 * @param row current maze row
	 * @param col currect maze column
	 * @return whether or not a solution path was found through this position
	 */
//	private boolean solveMaze(int row, int col) {
//		/* Solution algorithm:
//		 * - Set grid[row][col] equal to SOLUTION_PATH.
//		 * - Base case: If we're in the bottom-right corner, return true.
//		 * - Recursive case:
//		 * -- For each direction
//		 * --- If we can travel from [row][col] to [row2][col2] in that direction and it's not already on the SOLUTION_PATH,
//		 * ---- If we can recursively solve the maze from [row2][col2], return true.
//		 * -- Failing to find a solution, we set grid[row][col] back to REACHED and return false.
//		 */
//
//		// TODO - Implement algorithm above.
//		// This can be done in less than a dozen lines of code.
//	}

	/**
	 * Return a String representation of the maze with '#', ' ', and '.' representing wall, open path, and solution path (if solved), respectively.
	 */
	public String toString() {
		char[] gridChars = {'#', ' ', '.'};
		int[][] outGrid = new int[2 * rows + 1][2 * cols + 1];
		for (int r = 0; r < rows; r++)
			for (int c = 0; c < cols; c++) {
				int r2 = 2 * r + 1;
				int c2 = 2 * c + 1;
				outGrid[r2][c2] = grid[r][c];
				if (canTravel(r, c, RIGHT))
					outGrid[r2][c2 + 1] = (grid[r][c] == grid[r][c + 1]) ? grid[r][c] : REACHED;
				if (canTravel(r, c, DOWN))
					outGrid[r2 + 1][c2] = (grid[r][c] == grid[r + 1][c]) ? grid[r][c] : REACHED;
			}
		outGrid[0][1] = outGrid[1][1]; // upper left opening
		outGrid[2 * rows][2 * cols - 1] = outGrid[2 * rows - 1][2 * cols - 1]; // lower right opening
		StringBuffer sb = new StringBuffer();
		for (int r = 0; r < outGrid.length; r++) {
			for (int c = 0; c < outGrid[r].length; c++)
				sb.append(gridChars[outGrid[r][c]]);
			sb.append('\n');
		}
		return sb.toString();
	}

	public void exportImage(String filename)
	{
		// Create image
		int imageRows = 2 * rows + 1;
		int imageCols = 2 * cols + 1;
		BufferedImage bi = new BufferedImage(imageCols, imageRows, BufferedImage.TYPE_INT_RGB);

		// White background
		Graphics2D g = bi.createGraphics();
		g.setColor(Color.white);
		g.fill(new Rectangle(0, 0, imageCols, imageRows));

		// Get toString() and base pixel colors on String characters
		Scanner mazeIn = new Scanner(toString());
		for (int r = 0; r < imageRows; r++) {
			String row = mazeIn.nextLine();
			for (int c = 0; c < imageCols; c++) {
				char ch = row.charAt(c);
				if (ch == '#') // black wall
			        bi.setRGB(c, r, Color.BLACK.getRGB());
				else if (ch == '.') // green solution path
			        bi.setRGB(c, r, Color.GREEN.getRGB());
			}
		}
		mazeIn.close();

		// Write image to file
		File f = new File (filename + ".png");
		try {
			ImageIO.write(bi, "png", f);
		}
		catch (Exception e) {
			e.printStackTrace();
		}
	}

	/**
	 * Input the number of rows and columns from the user, construct a maze with those dimensions, print maze,
	 * export "maze.png" image file, solve it, print solved maze, and export "maze-solution.png".
	 * To make a truly eye-popping letter-size maze, run this from the terminal window with "java -Xss4m Maze"
	 * for increased call stack size and use 380 rows and 285 columns.
	 * @param args (unused)
	 */
	public static void main(String[] args) {
		Scanner in = new Scanner(System.in);
		System.out.print("Maze rows? ");
		int rows = in.nextInt();
		System.out.print("Maze columns? ");
		int cols = in.nextInt();
		in.close();
		Maze maze = new Maze(rows, cols);
		System.out.println(maze);
		System.out.println();
		maze.exportImage("maze");
		maze.solveMaze();
		System.out.println("Solution:");
		System.out.println(maze);
		maze.exportImage("maze-solution");
	}


}
