import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import Todo from "@/app/models/Todo";
import { verify } from 'jsonwebtoken';

export async function GET(request) {
  try {
    await connectDB();

    // Token check
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Login first' }, { status: 401 });
    }

    // Verify token
    let decoded;
    try {
      decoded = verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const todos = await Todo.find({ userId: decoded.userId }); // ✅ decoded.userId
    return NextResponse.json(todos, { status: 200 }); // ✅ Direct array return

  } catch (error) {
    console.error("GET todos error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Login first' }, { status: 401 });
    }

    // Verify token
    let decoded;
    try {
      decoded = verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.text || body.text.trim() === '') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // ✅ Spelling correction: Todo.create (not Todo.creat)
    const newTodo = await Todo.create({
      text: body.text,
      completed: false,
      userId: decoded.userId // ✅ decoded.userId
    });

    return NextResponse.json(newTodo, { status: 201 }); // ✅ Direct object return

  } catch (error) {
    console.error("POST todo error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();

    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Login first' }, { status: 401 });
    }
    // Verify token

    let decoded;
    try {
      decoded = verify(token, process.env.JWT_SECRET);
    }
    catch (error) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    const todo = await Todo.findById(id);
    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }
    if (todo.userId.toString() !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    await Todo.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Todo deleted' }, { status: 200 });
  } catch (error) {
    console.error("DELETE todo error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  }
}
export async function PUT(request) {
  try {
    await connectDB();
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Login first' }, { status: 401 });
    }
    // Verify token
    let decoded;
    try {
      decoded = verify(token, process.env.JWT_SECRET);
    }
    catch (error) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    const body = await request.json();
    const { id, text, completed } = body;
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    const todo = await Todo.findById(id);
    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }
    if (todo.userId.toString() !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    if (text !== undefined) todo.text = text;
    if (completed !== undefined) todo.completed = completed;
    await todo.save();
    return NextResponse.json(todo, { status: 200 });
  } catch (error) {
    console.error("PUT todo error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}